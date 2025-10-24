export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      Admin: {
        Row: {
          createdAt: string
          id: number
          walletAddr: string
        }
        Insert: {
          createdAt?: string
          id?: number
          walletAddr: string
        }
        Update: {
          createdAt?: string
          id?: number
          walletAddr?: string
        }
        Relationships: []
      }
      Ban: {
        Row: {
          anonId: string | null
          createdAt: string
          expiresAt: string | null
          id: number
          ipHash: string | null
          reason: string
          walletAddr: string | null
        }
        Insert: {
          anonId?: string | null
          createdAt?: string
          expiresAt?: string | null
          id?: number
          ipHash?: string | null
          reason: string
          walletAddr?: string | null
        }
        Update: {
          anonId?: string | null
          createdAt?: string
          expiresAt?: string | null
          id?: number
          ipHash?: string | null
          reason?: string
          walletAddr?: string | null
        }
        Relationships: []
      }
      Board: {
        Row: {
          about: string | null
          createdAt: string
          id: number
          isHidden: boolean
          slug: string
          title: string
          updatedAt: string
        }
        Insert: {
          about?: string | null
          createdAt?: string
          id?: number
          isHidden?: boolean
          slug: string
          title: string
          updatedAt: string
        }
        Update: {
          about?: string | null
          createdAt?: string
          id?: number
          isHidden?: boolean
          slug?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Channel: {
        Row: {
          createdAt: string | null
          createdBy: string | null
          description: string | null
          id: string
          imageUrl: string | null
          isPrivate: boolean | null
          maxMembers: number | null
          name: string
          slug: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          id: string
          imageUrl?: string | null
          isPrivate?: boolean | null
          maxMembers?: number | null
          name: string
          slug: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          createdBy?: string | null
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPrivate?: boolean | null
          maxMembers?: number | null
          name?: string
          slug?: string
          updatedAt?: string | null
        }
        Relationships: []
      }
      Message: {
        Row: {
          channelId: string
          content: string
          createdAt: string | null
          id: string
          imageUrl: string | null
          isDeleted: boolean | null
          isEdited: boolean | null
          replyToId: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          channelId: string
          content: string
          createdAt?: string | null
          id: string
          imageUrl?: string | null
          isDeleted?: boolean | null
          isEdited?: boolean | null
          replyToId?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          channelId?: string
          content?: string
          createdAt?: string | null
          id?: string
          imageUrl?: string | null
          isDeleted?: boolean | null
          isEdited?: boolean | null
          replyToId?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_channelId_fkey"
            columns: ["channelId"]
            isOneToOne: false
            referencedRelation: "Channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_replyToId_fkey"
            columns: ["replyToId"]
            isOneToOne: false
            referencedRelation: "Message"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Post: {
        Row: {
          anonId: string
          createdAt: string
          dislikes: number
          id: string
          imageUrl: string | null
          likes: number
          sage: boolean
          text: string
          threadId: string
          thumbUrl: string | null
          tripSig: string | null
        }
        Insert: {
          anonId: string
          createdAt?: string
          dislikes?: number
          id: string
          imageUrl?: string | null
          likes?: number
          sage?: boolean
          text: string
          threadId: string
          thumbUrl?: string | null
          tripSig?: string | null
        }
        Update: {
          anonId?: string
          createdAt?: string
          dislikes?: number
          id?: string
          imageUrl?: string | null
          likes?: number
          sage?: boolean
          text?: string
          threadId?: string
          thumbUrl?: string | null
          tripSig?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Post_threadId_fkey"
            columns: ["threadId"]
            isOneToOne: false
            referencedRelation: "Thread"
            referencedColumns: ["id"]
          },
        ]
      }
      Thread: {
        Row: {
          anonId: string
          boardId: number
          bumpAt: string
          createdAt: string
          id: string
          isLocked: boolean
          isSticky: boolean
          opImageUrl: string | null
          opText: string
          opThumbUrl: string | null
          subject: string | null
          tripSig: string | null
          updatedAt: string
          views: number
        }
        Insert: {
          anonId: string
          boardId: number
          bumpAt?: string
          createdAt?: string
          id: string
          isLocked?: boolean
          isSticky?: boolean
          opImageUrl?: string | null
          opText: string
          opThumbUrl?: string | null
          subject?: string | null
          tripSig?: string | null
          updatedAt: string
          views?: number
        }
        Update: {
          anonId?: string
          boardId?: number
          bumpAt?: string
          createdAt?: string
          id?: string
          isLocked?: boolean
          isSticky?: boolean
          opImageUrl?: string | null
          opText?: string
          opThumbUrl?: string | null
          subject?: string | null
          tripSig?: string | null
          updatedAt?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "Thread_boardId_fkey"
            columns: ["boardId"]
            isOneToOne: false
            referencedRelation: "Board"
            referencedColumns: ["id"]
          },
        ]
      }
      Transaction: {
        Row: {
          amount: number
          completedAt: string | null
          createdAt: string
          currency: string
          description: string | null
          fromAddress: string | null
          id: string
          status: string
          toAddress: string | null
          txHash: string | null
          type: string
          userId: string
        }
        Insert: {
          amount: number
          completedAt?: string | null
          createdAt?: string
          currency: string
          description?: string | null
          fromAddress?: string | null
          id: string
          status?: string
          toAddress?: string | null
          txHash?: string | null
          type: string
          userId: string
        }
        Update: {
          amount?: number
          completedAt?: string | null
          createdAt?: string
          currency?: string
          description?: string | null
          fromAddress?: string | null
          id?: string
          status?: string
          toAddress?: string | null
          txHash?: string | null
          type?: string
          userId?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          avatarUrl: string | null
          balanceEth: number | null
          balanceUsd: number | null
          createdAt: string | null
          id: string
          isVerified: boolean | null
          lastSeenAt: string | null
          updatedAt: string | null
          username: string | null
          walletAddress: string
        }
        Insert: {
          avatarUrl?: string | null
          balanceEth?: number | null
          balanceUsd?: number | null
          createdAt?: string | null
          id: string
          isVerified?: boolean | null
          lastSeenAt?: string | null
          updatedAt?: string | null
          username?: string | null
          walletAddress: string
        }
        Update: {
          avatarUrl?: string | null
          balanceEth?: number | null
          balanceUsd?: number | null
          createdAt?: string | null
          id?: string
          isVerified?: boolean | null
          lastSeenAt?: string | null
          updatedAt?: string | null
          username?: string | null
          walletAddress?: string
        }
        Relationships: []
      }
      Vote: {
        Row: {
          anonId: string
          createdAt: string
          id: string
          isLike: boolean
          postId: string
        }
        Insert: {
          anonId: string
          createdAt?: string
          id: string
          isLike: boolean
          postId: string
        }
        Update: {
          anonId?: string
          createdAt?: string
          id?: string
          isLike?: boolean
          postId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Vote_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "Post"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_messages: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
