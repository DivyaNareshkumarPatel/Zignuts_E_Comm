import "./globals.css"
import StoreProvider from "@/store/storeProvider"
import AuthListener from "@/components/AuthListener"
export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>
        <StoreProvider>
          <AuthListener>
            {children}
          </AuthListener>
        </StoreProvider>
      </body>
    </html>
  )
}