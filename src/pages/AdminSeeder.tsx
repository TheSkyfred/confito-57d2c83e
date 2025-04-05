
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSeeder = () => {
  const [count, setCount] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const seedUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const { data, error } = await supabase.functions.invoke('seed-users', {
        body: JSON.stringify({ count }),
      });

      if (error) {
        console.error('Erreur lors du seeding :', error);
        throw error;
      }

      setResult(data);
      toast({
        title: 'Utilisateurs créés avec succès',
        description: `${data.users.length} utilisateurs ont été ajoutés à la base de données.`,
      });
    } catch (err: any) {
      console.error('Erreur lors du seeding :', err);
      setError(err.message || 'Une erreur est survenue lors de la création des utilisateurs');
      toast({
        title: 'Erreur',
        description: 'Impossible de créer les utilisateurs. Vérifiez la console pour plus de détails.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin - Outil de génération de données</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Générer des utilisateurs aléatoires</CardTitle>
          <CardDescription>
            Cet outil crée des utilisateurs fictifs dans auth.users et profiles avec des données enrichies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <label htmlFor="count" className="block text-sm font-medium mb-2">
                Nombre d'utilisateurs à créer
              </label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="pt-8">
              <Button 
                onClick={seedUsers} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Générer les utilisateurs'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        
        {error && (
          <CardFooter>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
        
        {result && (
          <CardFooter>
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>
                {result.users.length} utilisateurs créés avec succès
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
      
      {result && result.users && result.users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs créés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d'utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crédits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.credits}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{user.bio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSeeder;
