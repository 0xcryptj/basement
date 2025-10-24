import { useState, useRef } from "react";
import { Menu, Upload, TrendingUp, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const ProfileMenu = () => {
  const { userId, address, network, disconnect } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const handleUsernameUpdate = async () => {
    if (!userId || !username.trim()) return;

    const { error } = await supabase
      .from('User')
      .update({ username: username.trim() })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Username updated!" });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setUsername("");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WEBP, or GIF image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload new avatar (don't delete old one due to RLS restrictions)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user record
      const { error: updateError } = await supabase
        .from('User')
        .update({ avatarUrl: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({ title: "Success", description: "Profile picture updated!" });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-primary/10"
          >
            <Avatar className="w-10 h-10 border-2 border-primary/30 rounded-lg">
              <AvatarImage src={userData?.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-pixel text-sm rounded-lg">
                {userData?.username?.[0]?.toUpperCase() || address?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Menu className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 bg-[hsl(220,30%,10%)] border-primary/20">
          <div className="px-2 py-2">
            <p className="font-pixel text-xs text-primary">
              {userData?.username || `User ${address?.slice(0, 8)}`}
            </p>
            <p className="font-mono text-[0.6rem] text-muted-foreground truncate">
              {address}
            </p>
          </div>
          
          <DropdownMenuSeparator className="bg-primary/20" />
          
          <DropdownMenuItem
            onClick={() => setIsSettingsOpen(true)}
            className="font-mono text-xs cursor-pointer hover:bg-primary/10"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setIsStatsOpen(true)}
            className="font-mono text-xs cursor-pointer hover:bg-primary/10"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            My Stats & PNL
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-primary/20" />
          
          <DropdownMenuItem
            onClick={disconnect}
            className="font-mono text-xs cursor-pointer hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[hsl(220,30%,10%)] border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-pixel text-lg text-primary">Profile Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="space-y-3">
              <Label className="font-mono text-xs text-muted-foreground">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/30">
                  <AvatarImage src={userData?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xl">
                    {userData?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                    className="font-mono text-xs"
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="font-mono text-[0.6rem] text-muted-foreground mt-2">
                    Max 2MB • JPEG, PNG, WEBP, GIF
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-3">
              <Label className="font-mono text-xs text-muted-foreground">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userData?.username || 'Enter username'}
                  className="font-mono text-sm"
                  maxLength={20}
                />
                <Button
                  onClick={handleUsernameUpdate}
                  disabled={!username.trim()}
                  size="sm"
                  className="font-mono text-xs"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Network Badge */}
            <div className="pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">Network</span>
                <span className={`font-pixel text-xs px-3 py-1 rounded ${
                  network === 'solana'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-primary/20 text-primary'
                }`}>
                  {network === 'solana' ? '◎ SOLANA' : '⟠ BASE'}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="bg-[hsl(220,30%,10%)] border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-pixel text-lg text-primary">My Stats & PNL</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 border border-primary/20 rounded p-3">
                <div className="font-mono text-xs text-muted-foreground mb-1">Total Wagered</div>
                <div className="font-pixel text-lg text-foreground">
                  {(userData?.totalWagered || 0).toFixed(3)} {network === 'solana' ? '◎' : '⟠'}
                </div>
              </div>
              
              <div className="bg-background/50 border border-primary/20 rounded p-3">
                <div className="font-mono text-xs text-muted-foreground mb-1">Games Played</div>
                <div className="font-pixel text-lg text-foreground">
                  {userData?.gamesPlayed || 0}
                </div>
              </div>
              
              <div className="bg-background/50 border border-accent/20 rounded p-3">
                <div className="font-mono text-xs text-muted-foreground mb-1">Total Won</div>
                <div className="font-pixel text-lg text-accent">
                  +{(userData?.totalWon || 0).toFixed(3)} {network === 'solana' ? '◎' : '⟠'}
                </div>
              </div>
              
              <div className="bg-background/50 border border-destructive/20 rounded p-3">
                <div className="font-mono text-xs text-muted-foreground mb-1">Total Lost</div>
                <div className="font-pixel text-lg text-destructive">
                  -{(userData?.totalLost || 0).toFixed(3)} {network === 'solana' ? '◎' : '⟠'}
                </div>
              </div>
            </div>

            <div className="bg-background/50 border-2 border-primary rounded p-4">
              <div className="font-mono text-xs text-muted-foreground mb-2">Net Profit/Loss</div>
              <div className={`font-pixel text-2xl ${
                (userData?.netProfit || 0) >= 0 ? 'text-accent' : 'text-destructive'
              }`}>
                {(userData?.netProfit || 0) >= 0 ? '+' : ''}{(userData?.netProfit || 0).toFixed(3)} {network === 'solana' ? '◎' : '⟠'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-primary/20">
              <span className="font-mono text-xs text-muted-foreground">Win Rate</span>
              <span className="font-pixel text-sm text-primary">
                {(userData?.winRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
