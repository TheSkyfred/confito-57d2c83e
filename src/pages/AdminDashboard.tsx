import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabaseDirect } from '@/utils/supabaseAdapter';

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  MessageSquare,
  User,
  PackageCheck,
  PackageX,
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const AdminDashboard = () => {
  const { user, session, signOut } = useAuth();
  const [pendingJams, setPendingJams] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingJamsLoading, setPendingJamsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [pendingJamsPage, setPendingJamsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [pendingJamsTotalPages, setPendingJamsTotalPages] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJamId, setSelectedJamId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const JAMS_PER_PAGE = 5;
  const REPORTS_PER_PAGE = 5;

  useEffect(() => {
    if (!user || !session) {
      signOut();
      return;
    }

    fetchPendingJams();
    fetchReports();
  }, [user, session, signOut, pendingJamsPage, reportsPage]);

  const fetchPendingJams = async () => {
    if (!user) return;
    setPendingJamsLoading(true);

    try {
      const { data, error, count } = await supabase
        .from('jams')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .range((pendingJamsPage - 1) * JAMS_PER_PAGE, pendingJamsPage * JAMS_PER_PAGE - 1);

      if (error) throw error;

      setPendingJams(data || []);
      setPendingJamsTotalPages(Math.ceil((count || 0) / JAMS_PER_PAGE));
    } catch (error: any) {
      console.error('Error fetching pending jams:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les confitures en attente",
        variant: "destructive"
      });
    } finally {
      setPendingJamsLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      // Replace with your actual reports fetching logic
      const mockReports = [
        {
          id: '1',
          reporterName: 'Alice Dupont',
          reportType: 'Inappropriate Content',
          itemId: '5678',
          itemType: 'comment',
          content: 'Ce commentaire contient des propos inappropriés.',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          reporterName: 'Michel Martin',
          reportType: 'Fraud',
          itemId: '1234',
          itemType: 'jam',
          content: 'Cette confiture n\'est pas comme décrite dans l\'annonce.',
          status: 'resolved',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '3',
          reporterName: 'Sophie Lemaire',
          reportType: 'Spam',
          itemId: '9012',
          itemType: 'user',
          content: 'Cet utilisateur envoie des messages non sollicités.',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
          id: '4',
          reporterName: 'David Bernard',
          reportType: 'Harassment',
          itemId: '3456',
          itemType: 'comment',
          content: 'Ce commentaire est harcelant et offensant.',
          status: 'pending',
          createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        },
        {
          id: '5',
          reporterName: 'Isabelle Garcia',
          reportType: 'Copyright Violation',
          itemId: '7890',
          itemType: 'jam',
          content: 'Cette confiture utilise une image protégée par le droit d\'auteur.',
          status: 'resolved',
          createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
        },
        {
          id: '6',
          reporterName: 'Thomas Dubois',
          reportType: 'Misleading Information',
          itemId: '4321',
          itemType: 'jam',
          content: 'Les informations sur cette confiture sont trompeuses.',
          status: 'pending',
          createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
        },
        {
          id: '7',
          reporterName: 'Emilie Lefevre',
          reportType: 'Privacy Violation',
          itemId: '6543',
          itemType: 'user',
          content: 'Cet utilisateur divulgue des informations personnelles.',
          status: 'pending',
          createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
        },
        {
          id: '8',
          reporterName: 'Antoine Richard',
          reportType: 'Hate Speech',
          itemId: '2109',
          itemType: 'comment',
          content: 'Ce commentaire contient des propos haineux.',
          status: 'pending',
          createdAt: new Date(Date.now() - 604800000).toISOString() // 7 days ago
        },
        {
          id: '9',
          reporterName: 'Julie Garnier',
          reportType: 'Impersonation',
          itemId: '8765',
          itemType: 'user',
          content: 'Cet utilisateur se fait passer pour une autre personne.',
          status: 'resolved',
          createdAt: new Date(Date.now() - 691200000).toISOString() // 8 days ago
        },
        {
          id: '10',
          reporterName: 'Lucas Moreau',
          reportType: 'Illegal Activities',
          itemId: '3210',
          itemType: 'jam',
          content: 'Cette confiture est liée à des activités illégales.',
          status: 'pending',
          createdAt: new Date(Date.now() - 777600000).toISOString() // 9 days ago
        }
      ];

      setReports(mockReports);
      setFilteredReports(mockReports);
      setReportsTotalPages(Math.ceil(mockReports.length / REPORTS_PER_PAGE));
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les signalements",
        variant: "destructive"
      });
    } finally {
      setReportsLoading(false);
    }
  };

  const pendingJamsRefetch = () => {
    fetchPendingJams();
  };

  const approveJam = async (jamId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabaseDirect.update(
        'jams',
        { status: 'approved' },
        { id: jamId }
      );
      
      if (error) throw error;
      
      toast({
        title: "Confiture approuvée",
        description: "La confiture est maintenant visible pour tous les utilisateurs",
      });
      
      // Refresh the list
      pendingJamsRefetch();
    } catch (error: any) {
      console.error('Error approving jam:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver cette confiture",
        variant: "destructive"
      });
    }
  };

  const rejectJam = async (jamId: string, reason: string = "Cette confiture ne répond pas à nos critères de qualité.") => {
    if (!user) return;
    
    try {
      const { error } = await supabaseDirect.update(
        'jams',
        { 
          status: 'rejected', 
          rejection_reason: reason 
        },
        { id: jamId }
      );
      
      if (error) throw error;
      
      toast({
        title: "Confiture rejetée",
        description: "La confiture a été rejetée",
      });
      
      // Refresh the list
      pendingJamsRefetch();
    } catch (error: any) {
      console.error('Error rejecting jam:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter cette confiture",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setLoading(pendingJamsLoading || reportsLoading);
  }, [pendingJamsLoading, reportsLoading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = reports.filter(report =>
        report.reporterName.toLowerCase().includes(query.toLowerCase()) ||
        report.reportType.toLowerCase().includes(query.toLowerCase()) ||
        report.content.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredReports(filtered);
      setReportsTotalPages(Math.ceil(filtered.length / REPORTS_PER_PAGE));
    } else {
      setFilteredReports(reports);
      setReportsTotalPages(Math.ceil(reports.length / REPORTS_PER_PAGE));
    }
  };

  const handleOpenRejectModal = (jamId: string | null) => {
    setSelectedJamId(jamId);
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedJamId(null);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (selectedJamId) {
      rejectJam(selectedJamId, rejectionReason);
      handleCloseRejectModal();
    }
  };

  const goToPreviousPendingJamsPage = () => {
    setPendingJamsPage(Math.max(1, pendingJamsPage - 1));
  };

  const goToNextPendingJamsPage = () => {
    setPendingJamsPage(Math.min(pendingJamsTotalPages, pendingJamsPage + 1));
  };

  const goToFirstPendingJamsPage = () => {
    setPendingJamsPage(1);
  };

  const goToLastPendingJamsPage = () => {
    setPendingJamsPage(pendingJamsTotalPages);
  };

  const goToPreviousReportsPage = () => {
    setReportsPage(Math.max(1, reportsPage - 1));
  };

  const goToNextReportsPage = () => {
    setReportsPage(Math.min(reportsTotalPages, reportsPage + 1));
  };

  const goToFirstReportsPage = () => {
    setReportsPage(1);
  };

  const goToLastReportsPage = () => {
    setReportsPage(reportsTotalPages);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Tableau de bord administrateur</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  const mockReports = [
    {
      id: '1',
      reporterName: 'Alice Dupont',
      reportType: 'Inappropriate Content',
      itemId: '5678',
      itemType: 'comment',
      content: 'Ce commentaire contient des propos inappropriés.',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      reporterName: 'Michel Martin',
      reportType: 'Fraud',
      itemId: '1234',
      itemType: 'jam',
      content: 'Cette confiture n\'est pas comme décrite dans l\'annonce.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: '3',
      reporterName: 'Sophie Lemaire',
      reportType: 'Spam',
      itemId: '9012',
      itemType: 'user',
      content: 'Cet utilisateur envoie des messages non sollicités.',
      status: 'pending',
      createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: '4',
      reporterName: 'David Bernard',
      reportType: 'Harassment',
      itemId: '3456',
      itemType: 'comment',
      content: 'Ce commentaire est harcelant et offensant.',
      status: 'pending',
      createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: '5',
      reporterName: 'Isabelle Garcia',
      reportType: 'Copyright Violation',
      itemId: '7890',
      itemType: 'jam',
      content: 'Cette confiture utilise une image protégée par le droit d\'auteur.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    },
    {
      id: '6',
      reporterName: 'Thomas Dubois',
      reportType: 'Misleading Information',
      itemId: '4321',
      itemType: 'jam',
      content: 'Les informations sur cette confiture sont trompeuses.',
      status: 'pending',
      createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    },
    {
      id: '7',
      reporterName: 'Emilie Lefevre',
      reportType: 'Privacy Violation',
      itemId: '6543',
      itemType: 'user',
      content: 'Cet utilisateur divulgue des informations personnelles.',
      status: 'pending',
      createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
    },
    {
      id: '8',
      reporterName: 'Antoine Richard',
      reportType: 'Hate Speech',
      itemId: '2109',
      itemType: 'comment',
      content: 'Ce commentaire contient des propos haineux.',
      status: 'pending',
      createdAt: new Date(Date.now() - 604800000).toISOString() // 7 days ago
    },
    {
      id: '9',
      reporterName: 'Julie Garnier',
      reportType: 'Impersonation',
      itemId: '8765',
      itemType: 'user',
      content: 'Cet utilisateur se fait passer pour une autre personne.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 691200000).toISOString() // 8 days ago
    },
    {
      id: '10',
      reporterName: 'Lucas Moreau',
      reportType: 'Illegal Activities',
      itemId: '3210',
      itemType: 'jam',
      content: 'Cette confiture est liée à des activités illégales.',
      status: 'pending',
      createdAt: new Date(Date.now() - 777600000).toISOString() // 9 days ago
    }
  ];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord administrateur</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Confitures en attente de validation</h2>
        {pendingJamsLoading ? (
          <p>Chargement des confitures en attente...</p>
        ) : pendingJams.length > 0 ? (
          <>
            <Table>
              <TableCaption>Confitures en attente de validation.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingJams.map(jam => (
                  <TableRow key={jam.id}>
                    <TableCell className="font-medium">{format(new Date(jam.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{jam.name}</TableCell>
                    <TableCell>{jam.creator_id}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => approveJam(jam.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleOpenRejectModal(jam.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToFirstPendingJamsPage}
                  disabled={pendingJamsPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">Aller à la première page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPendingJamsPage}
                  disabled={pendingJamsPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Page précédente</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPendingJamsPage}
                  disabled={pendingJamsPage === pendingJamsTotalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Page suivante</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToLastPendingJamsPage}
                  disabled={pendingJamsPage === pendingJamsTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Aller à la dernière page</span>
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Page {pendingJamsPage} sur {pendingJamsTotalPages}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-4">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <p>Aucune confiture en attente de validation.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Signalements</h2>
        <div className="mb-4 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher un signalement..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1"
          />
        </div>
        {reportsLoading ? (
          <p>Chargement des signalements...</p>
        ) : (filteredReports.length > 0) ? (
          <>
            <Table>
              <TableCaption>Liste des signalements.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports
                  .slice((reportsPage - 1) * REPORTS_PER_PAGE, reportsPage * REPORTS_PER_PAGE)
                  .map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell>{report.reportType}</TableCell>
                      <TableCell>{report.content}</TableCell>
                      <TableCell>
                        {report.status === 'pending' ? (
                          <Badge variant="secondary">En attente</Badge>
                        ) : (
                          <Badge variant="outline">Résolu</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' ? (
                          <Button variant="ghost" size="sm">
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Marquer comme résolu
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <PackageX className="mr-2 h-4 w-4" />
                            Rouvrir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToFirstReportsPage}
                  disabled={reportsPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">Aller à la première page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousReportsPage}
                  disabled={reportsPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Page précédente</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextReportsPage}
                  disabled={reportsPage === reportsTotalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Page suivante</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToLastReportsPage}
                  disabled={reportsPage === reportsTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Aller à la dernière page</span>
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Page {reportsPage} sur {reportsTotalPages}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-4">
            <MessageSquare className="mr-2 h-4 w-4" />
            <p>Aucun signalement trouvé.</p>
          </div>
        )}
      </section>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejeter la confiture</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir rejeter cette confiture ? Veuillez fournir une raison.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseRejectModal}>
              Annuler
            </Button>
            <Button type="button" onClick={handleConfirmReject} className="ml-2">
              Rejeter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
