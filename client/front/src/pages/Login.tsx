import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth, type AuthUser } from "../context/AuthContext";

const API_URL = `${(import.meta.env.VITE_API_URL ?? "http://localhost:9010/api").replace(/\/+$/, "")}/auth`;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number }) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

interface ApiResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
}

const getLoginDestination = (state: unknown, user: AuthUser) => {
  if (user.role === "admin") return "/admin";
  if (state && typeof state === "object" && "from" in state) {
    const from = state.from;
    if (from && typeof from === "object" && "pathname" in from && typeof from.pathname === "string" &&
      from.pathname.startsWith("/") && !from.pathname.startsWith("//")) {
      const search = "search" in from && typeof from.search === "string" ? from.search : "";
      const hash = "hash" in from && typeof from.hash === "string" ? from.hash : "";
      return `${from.pathname}${search}${hash}`;
    }
  }
  return user.role === "admin" ? "/admin" : "/";
};

const readResponse = async (response: Response): Promise<ApiResponse> => {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida");
  }

  if (!data || typeof data !== "object") {
    throw new Error("El servidor devolvió una respuesta inválida");
  }
  return data as ApiResponse;
};

const loadGoogleIdentity = (): Promise<GoogleIdentityApi> =>
  new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    const onLoad = () => {
      if (window.google) resolve(window.google);
      else reject(new Error("No se pudo cargar el inicio de sesión de Google"));
    };
    const onError = () => reject(new Error("No se pudo cargar el inicio de sesión de Google"));

    if (!script) {
      script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
  });

const Login = () => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Verificando tu correo...");
  const [resetComplete, setResetComplete] = useState(false);
  const googleButton = useRef<HTMLDivElement>(null);
  const verificationTokenRequested = useRef<string | null>(null);
  const { token: routeToken } = useParams();
  const location = useLocation();
  const { pathname } = location;
  const isVerifying = pathname.startsWith("/verificar/");
  const isResetting = pathname.startsWith("/restablecer/");
  const { login } = useAuth();
  const navigate = useNavigate();

  const signInWithGoogle = useCallback(async (credential: string) => {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.message ?? "No se pudo iniciar sesión con Google");
      if (!data.token || !data.user) throw new Error("El servidor no devolvió una sesión válida");

      login(data.token, data.user);
      navigate(getLoginDestination(location.state, data.user), { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo iniciar sesión con Google");
    } finally {
      setBusy(false);
    }
  }, [login, location.state, navigate]);

  useEffect(() => {
    if (!isVerifying || !routeToken || verificationTokenRequested.current === routeToken) return;

    verificationTokenRequested.current = routeToken;
    let active = true;
    fetch(`${API_URL}/verify-email/${encodeURIComponent(routeToken)}`)
      .then(readResponse)
      .then((data) => {
        if (active) setVerificationStatus(data.message ?? "No se pudo verificar el correo");
      })
      .catch((requestError: unknown) => {
        if (active) {
          setVerificationStatus(requestError instanceof Error ? requestError.message : "No se pudo verificar el correo");
        }
      });

    return () => {
      active = false;
    };
  }, [isVerifying, routeToken]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButton.current || (mode !== "login" && mode !== "register")) return;

    let active = true;
    loadGoogleIdentity()
      .then((google) => {
        if (!active || !googleButton.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => {
            void signInWithGoogle(credential);
          },
        });
        google.accounts.id.renderButton(googleButton.current, { theme: "outline", size: "large", width: 320 });
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "No se pudo cargar Google");
      });

    return () => {
      active = false;
      googleButton.current?.replaceChildren();
    };
  }, [mode, signInWithGoogle]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setCanResendVerification(false);
    setBusy(true);

    let endpoint: string;
    let body: Record<string, string>;
    if (isResetting) {
      endpoint = "reset-password";
      body = { token: routeToken ?? "", password };
    } else if (mode === "register") {
      endpoint = "register";
      body = { name, email, password };
    } else if (mode === "forgot") {
      endpoint = "forgot-password";
      body = { email };
    } else {
      endpoint = "login";
      body = { email, password };
    }

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readResponse(response);
      if (!response.ok) {
        if ((endpoint === "register" && response.status === 502) ||
          (endpoint === "login" && response.status === 403)) {
          setCanResendVerification(true);
        }
        throw new Error(data.message ?? "No se pudo completar la solicitud");
      }

      if (endpoint === "login") {
        if (!data.token || !data.user) throw new Error("El servidor no devolvió una sesión válida");
        login(data.token, data.user);
        navigate(getLoginDestination(location.state, data.user), { replace: true });
      } else if (endpoint === "reset-password") {
        setResetComplete(true);
        setNotice(data.message ?? "Contraseña actualizada");
      } else {
        setNotice(data.message ?? "Solicitud completada");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo completar la solicitud");
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.message ?? "No se pudo reenviar el correo");
      setNotice(data.message ?? "Si la cuenta está pendiente, enviaremos un nuevo enlace.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo reenviar el correo");
    } finally {
      setBusy(false);
    }
  };

  if (isVerifying) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
        <section className="w-full max-w-sm border border-neutral-200 bg-white p-6 shadow-sm">
          <Link to="/" className="text-xl font-black">SÜD23</Link>
          <h1 className="mt-8 text-2xl font-black uppercase">Verificación de correo</h1>
          <p className="mt-4 text-sm text-neutral-700">{verificationStatus}</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-bold underline">Ir a iniciar sesión</Link>
        </section>
      </main>
    );
  }

  if (isResetting && resetComplete) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
        <section className="w-full max-w-sm border border-neutral-200 bg-white p-6 shadow-sm">
          <Link to="/" className="text-xl font-black">SÜD23</Link>
          <h1 className="mt-8 text-2xl font-black uppercase">Contraseña actualizada</h1>
          <p className="mt-4 text-sm text-neutral-700">{notice}</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-bold underline">Iniciar sesión</Link>
        </section>
      </main>
    );
  }

  const title = isResetting
    ? "Nueva contraseña"
    : mode === "register"
      ? "Crear cuenta"
      : mode === "forgot"
        ? "Recuperar contraseña"
        : "Iniciar sesión";

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-neutral-200 bg-white p-6 shadow-sm">
        <Link to="/" className="text-xl font-black">SÜD23</Link>
        <h1 className="mt-8 text-2xl font-black uppercase">{title}</h1>

        {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-4 border border-green-300 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        {!isResetting && mode === "register" && (
          <input required autoComplete="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="mt-5 w-full border px-3 py-3 text-sm" />
        )}
        {!isResetting && (
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="mt-3 w-full border px-3 py-3 text-sm" />
        )}
        {(isResetting || mode !== "forgot") && (
          <input required type="password" autoComplete={isResetting || mode === "register" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña (mínimo 8 caracteres)" className="mt-3 w-full border px-3 py-3 text-sm" />
        )}

        <button type="submit" disabled={busy} className="mt-5 w-full bg-black py-3 text-xs font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Procesando..." : isResetting ? "Guardar contraseña" : mode === "login" ? "Ingresar" : mode === "register" ? "Registrarme" : "Enviar enlace"}
        </button>

        {!isResetting && mode === "login" && (
          <button type="button" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }} className="mt-4 w-full text-xs underline">
            Olvidé mi contraseña
          </button>
        )}
        {canResendVerification && mode !== "forgot" && (
          <button
            type="button"
            disabled={busy || !email}
            onClick={() => void resendVerification()}
            className="mt-3 w-full text-xs underline disabled:opacity-50"
          >
            Reenviar correo de verificación
          </button>
        )}
        {!isResetting && mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-neutral-500">
              <span className="h-px flex-1 bg-neutral-200" />
              <span>O continúa con</span>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>
            {GOOGLE_CLIENT_ID
              ? <div ref={googleButton} className="flex min-h-10 justify-center" />
              : <p className="text-center text-xs text-neutral-500">
                  Google requiere configurar el mismo Client ID en client/front/.env y server/.env
                </p>}
          </>
        )}
        {!isResetting && (
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setNotice("");
              setCanResendVerification(false);
            }}
            className="mt-4 w-full text-xs font-bold underline"
          >
            {mode === "login" ? "Crear una cuenta" : mode === "register" ? "Ya tengo una cuenta" : "Volver a iniciar sesión"}
          </button>
        )}
      </form>
    </main>
  );
};

export default Login;
