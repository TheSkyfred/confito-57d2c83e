
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour la connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // État pour l'inscription
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast.error("Échec de connexion", {
        description: error.message,
      });
    } else {
      toast.success("Connexion réussie", {
        description: "Vous êtes maintenant connecté à votre compte.",
      });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(registerEmail, registerPassword, registerUsername);
    
    if (error) {
      toast.error("Échec d'inscription", {
        description: error.message,
      });
    } else {
      toast.success("Inscription réussie", {
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="container max-w-md py-10">
      <div className="text-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-jam-dark">
          Bienvenue sur <span className="text-jam-raspberry">JamJam</span>
        </h1>
        <p className="text-jam-dark/70 mt-2">
          Rejoignez notre communauté de passionnés de confitures artisanales
        </p>
      </div>

      <Card>
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <a href="#" className="text-sm font-medium text-jam-raspberry hover:underline">
                      Mot de passe oublié?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Nom d'utilisateur</Label>
                  <Input 
                    id="register-username" 
                    placeholder="utilisateur123"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input 
                    id="register-password" 
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-center text-sm text-gray-500 mt-2">
            En vous inscrivant, vous acceptez nos{' '}
            <a href="#" className="text-jam-raspberry hover:underline">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-jam-raspberry hover:underline">
              politique de confidentialité
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
