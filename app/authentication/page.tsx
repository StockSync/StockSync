"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface Errors {
  [key: string]: string;
}

const AuthenticationPage = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Errors>({});

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });
  const [registerErrors, setRegisterErrors] = useState<Errors>({});

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLogin = (): boolean => {
    const errors: Errors = {};

    if (!loginData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(loginData.email)) {
      errors.email = "E-mail inválido";
    }

    if (!loginData.password.trim()) {
      errors.password = "Senha é obrigatória";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = (): boolean => {
    const errors: Errors = {};

    if (!registerData.name.trim()) {
      errors.name = "Nome é obrigatório";
    }

    if (!registerData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(registerData.email)) {
      errors.email = "E-mail inválido";
    }

    if (!registerData.password.trim()) {
      errors.password = "Senha é obrigatória";
    } else if (registerData.password.length < 8) {
      errors.password = "A senha deve ter pelo menos 8 caracteres";
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fakeApiCall = (
    data: LoginData | RegisterData,
    type: "login" | "register"
  ): Promise<LoginData | RegisterData> => {
    setLoading(true);
    setMessage(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        setMessage(
          type === "login"
            ? "✅ Login realizado com sucesso!"
            : "🎉 Conta criada com sucesso!"
        );
        resolve(data);
      }, 1500);
    });
  };

  const handleLoginSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    if (validateLogin()) {
      await fakeApiCall(loginData, "login");
      console.log("Login:", loginData);
    }
  };

  const handleRegisterSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    if (validateRegister()) {
      await fakeApiCall(registerData, "register");
      console.log("Registro:", registerData);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Criar conta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader className="pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src="/logo.svg"
                  alt="Stock Sync Logo"
                  className="h-40 w-40 object-contain"
                />
              </div>
              <CardTitle className="mt-2 text-2xl">Faça seu login</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seuemail@email.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                  />
                  {loginErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="****"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {loginErrors.password}
                    </p>
                  )}
                  <div className="mt-2 text-center">
                    <a
                      href="#"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                </div>

                <Button
                  onClick={handleLoginSubmit}
                  className="w-full bg-purple-700 text-white hover:bg-purple-800"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Acessar"
                  )}
                </Button>
              </div>

              {message && (
                <p className="mt-3 text-center text-sm text-green-600">
                  {message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader className="pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src="/logo.svg"
                  alt="Stock Sync Logo"
                  className="h-40 w-40 object-contain"
                />
              </div>
              <CardTitle className="mt-2 text-2xl">Criar conta</CardTitle>
              <CardDescription>Preencha os dados abaixo</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="register-name">Nome</Label>
                  <Input
                    id="register-name"
                    placeholder="Seu nome completo"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                  />
                  {registerErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {registerErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seuemail@email.com"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="****"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleRegisterSubmit}
                  className="w-full bg-purple-700 text-white hover:bg-purple-800"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </div>

              {message && (
                <p className="mt-3 text-center text-sm text-green-600">
                  {message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationPage;
