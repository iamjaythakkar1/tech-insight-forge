
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { User, UserPlus, Trash2, Edit, Mail } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id');
      
      if (adminError) throw adminError;
      
      const adminUserIds = adminUsers.map(admin => admin.user_id);

      // For now, we'll simulate getting users since we can't access auth.admin without service role
      // In a real implementation, this would require a server-side function
      const mockUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          is_admin: true
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      if (!newUserEmail || !newUserPassword) {
        toast.error("Email and password are required");
        return;
      }

      // In a real implementation, this would need to be done server-side
      // with proper admin privileges
      toast.info('User creation requires server-side implementation');
      
      setIsCreateModalOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // In a real implementation, this would need to be done server-side
      toast.info('User deletion requires server-side implementation');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const toggleAdminStatus = async (user: UserData) => {
    try {
      if (user.is_admin) {
        // Remove from admin_users
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Update local state
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, is_admin: false } : u
        ));
        
        toast.success('Admin privileges revoked');
      } else {
        // Add to admin_users
        const { error } = await supabase
          .from('admin_users')
          .insert([{ user_id: user.id }]);
        
        if (error) throw error;
        
        // Update local state
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, is_admin: true } : u
        ));
        
        toast.success('Admin privileges granted');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update user status');
    }
  };

  const resetPassword = async (userId: string, email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center my-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Create a new user to get started.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.email}</p>
                        {user.is_admin && (
                          <Badge>Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.last_sign_in_at && (
                        <p className="text-sm text-slate-500">
                          Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resetPassword(user.id, user.email)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={user.is_admin ? "destructive" : "outline"} 
                      size="sm"
                      onClick={() => toggleAdminStatus(user)}
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Enter the details for a new user account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input 
                id="password" 
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={createUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
