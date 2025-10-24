import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('User')
        .update({
          display_name: displayName,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          username: displayName,
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

          <div>
            <label className="font-pixel text-xs text-muted-foreground mb-2 block">
              Avatar URL (Optional)
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="font-mono bg-background border-primary/30"
              placeholder="https://..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !displayName}
            className="w-full font-pixel bg-primary hover:bg-primary/80"
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};