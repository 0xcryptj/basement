import { useState, useRef } from "react";
import { Upload, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Account = () => {
  const { userId, address, network } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [username, setUsername] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [uploading, setUploading] = useState(false);

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

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive",
      });
      return;
    }

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('User')
        .update({ avatarUrl: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({ title: "Success", description: "Profile picture updated!" });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    } catch (error: unknown) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-pixel text-3xl text-primary mb-8">Account Details</h1>
          
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <Label className="font-pixel text-sm text-primary mb-4 block">Profile Picture</Label>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 rounded-lg border-2 border-[#0052FF]">
                  <AvatarImage src={userData?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-pixel text-2xl rounded-lg">
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
                    className="font-mono text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    Max 2MB • JPEG, PNG, WEBP, GIF
                  </p>
                </div>
              </div>
            </Card>

            {/* Username */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <Label className="font-pixel text-sm text-primary mb-4 block">Display Name</Label>
              <div className="flex gap-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userData?.username || 'Enter username'}
                  className="font-mono"
                  maxLength={20}
                />
                <Button
                  onClick={handleUsernameUpdate}
                  disabled={!username.trim()}
                  className="font-mono"
                >
                  Save
                </Button>
              </div>
            </Card>

            {/* Date Joined */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <Label className="font-pixel text-sm text-primary mb-2 block">Date Joined</Label>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </Card>

            {/* Client Seed */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <Label className="font-pixel text-sm text-primary mb-4 block">Client Seed</Label>
              <div className="flex gap-3">
                <Input
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                  placeholder="Enter client seed for provably fair"
                  className="font-mono"
                />
                <Button className="font-mono">Save</Button>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                Used for provably fair game verification
              </p>
            </Card>

            {/* Wallet Address */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <Label className="font-pixel text-sm text-primary mb-2 block">Connected Wallet</Label>
              <div className="bg-background border border-primary/20 rounded p-3">
                <p className="font-mono text-sm text-foreground break-all">
                  {address}
                </p>
                <p className="font-mono text-xs mt-2 text-[#0052FF]">
                  ⟠ Base Network
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Account;
