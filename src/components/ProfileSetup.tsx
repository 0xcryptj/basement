import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ProfileSetupProps {
  isOpen: boolean;
  userId: string;
  walletAddress: string;
  onComplete: () => void;
}

export const ProfileSetup = ({ isOpen, userId, walletAddress, onComplete }: ProfileSetupProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(`user_${walletAddress.slice(0, 8)}`);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Avatar must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${walletAddress}.${ext}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);

      toast({
        title: 'Avatar uploaded!',
        description: 'Your profile picture has been set',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('User')
        .update({
          username: displayName,
          avatarUrl: avatarUrl || null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Profile Created!',
        description: 'Welcome to The Basement',
      });

      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-card border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary">Create Your Profile</DialogTitle>
          <DialogDescription className="font-mono text-muted-foreground">
            Set up your arcade profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24 border-2 border-primary/40">
              <AvatarImage src={avatarUrl} alt="Avatar" />
              <AvatarFallback className="bg-primary/10 text-primary font-pixel text-2xl">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded hover:bg-primary/20 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="font-pixel text-xs text-muted-foreground mb-2 block">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="font-mono bg-background border-primary/30"
              maxLength={20}
            />
          </div>

          <div>
            <label className="font-pixel text-xs text-muted-foreground mb-2 block">
              Bio (Optional)
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="font-mono bg-background border-primary/30 min-h-[80px]"
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !displayName || uploading}
            className="w-full font-pixel bg-primary hover:bg-primary/80"
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};