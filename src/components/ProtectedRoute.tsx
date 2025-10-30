import { Navigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to access this feature",
        variant: "default",
      });
    }
  }, [isConnected, toast]);

  if (!isConnected) {
    return <Navigate to="/forum" replace />;
  }

  return <>{children}</>;
};

