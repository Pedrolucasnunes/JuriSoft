/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Impede que o site seja embutido em iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Impede que o browser tente adivinhar o tipo de conteúdo
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Força HTTPS em browsers que já visitaram o site
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Controla quais informações de referência são enviadas
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restringe acesso a APIs sensíveis do browser
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
