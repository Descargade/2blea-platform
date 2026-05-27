import LoginForm from "@/components/shared/login-form";

export default function AdminLogin() {
  return <LoginForm redirectTo="/admin/dashboard" />;
}
