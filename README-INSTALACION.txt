LEZCANO — Refinamiento Auth + Pagos v1

Reemplazar/agregar respetando exactamente estas rutas:

app/login/page.tsx
app/login/LoginForm.tsx  (NUEVO)
app/registro/page.tsx
app/recuperar-password/page.tsx
app/actualizar-password/page.tsx
app/actualizar-password/UpdatePasswordForm.tsx
app/lib/auth/actions.ts
app/auth/confirm/route.ts
app/pedido-confirmado/page.tsx
app/pago/resultado/page.tsx

NO reemplaza app/mi-cuenta: esa parte se deja como ya la tenés.

Después:
1) npm run dev
2) probar login, registro, recuperar contraseña, cambiar contraseña,
   pedido-confirmado y pago/resultado.
3) npm run build antes de Git.
