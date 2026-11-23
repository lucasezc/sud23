declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string; // Opcional
      DATABASE_URL: string; // Requerida (para TS)
      JWT_SECRET: string;
      ADMIN_NAME?: string;
      ADMIN_EMAIL?: string;
      ADMIN_PASSWORD?: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      SMTP_FROM?: string;
      CLIENT_URL?: string;
      GOOGLE_CLIENT_ID?: string;
      MERCADOPAGO_ACCESS_TOKEN?: string;
      MERCADOPAGO_SHIPPING_COST?: string;
      MERCADOPAGO_FREE_SHIPPING_THRESHOLD?: string;
      MERCADOPAGO_WEBHOOK_SECRET?: string;
      PUBLIC_URL?: string;
    }
  }
}

export {}; // Necesario para que TS lo trate como un módulo
