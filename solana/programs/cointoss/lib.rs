// Solana CoinToss Program - The Basement Arcade
// A simple PvP coin flip game on Solana

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("11111111111111111111111111111111"); // Will be replaced after deployment

#[program]
pub mod cointoss {
    use super::*;

    // Create a new game
    pub fn create_game(ctx: Context<CreateGame>, bet_amount: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = &ctx.accounts.player;

        // Validate bet amount
        require!(bet_amount > 0, ErrorCode::InvalidBetAmount);
        require!(bet_amount >= 10_000, ErrorCode::BetTooSmall); // Min 0.00001 SOL

        // Initialize game state
        game.player1 = player.key();
        game.player2 = Pubkey::default();
        game.bet_amount = bet_amount;
        game.pot = bet_amount;
        game.house_fee = bet_amount * 5 / 100; // 5% fee
        game.winner = Pubkey::default();
        game.state = GameState::WaitingForOpponent;
        game.created_at = Clock::get()?.unix_timestamp;
        game.bump = ctx.bumps.game;

        // Transfer bet from player to game PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: player.to_account_info(),
                    to: game.to_account_info(),
                },
            ),
            bet_amount,
        )?;

        msg!("Game created by {}", player.key());
        Ok(())
    }

    // Join an existing game
    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = &ctx.accounts.player;

        // Validate game state
        require!(game.state == GameState::WaitingForOpponent, ErrorCode::GameNotWaiting);
        require!(game.player1 != player.key(), ErrorCode::CannotPlaySelf);

        // Player 2 joins
        game.player2 = player.key();
        game.pot += game.bet_amount;
        game.state = GameState::InProgress;

        // Transfer bet from player2 to game PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: player.to_account_info(),
                    to: game.to_account_info(),
                },
            ),
            game.bet_amount,
        )?;

        msg!("Player 2 joined: {}", player.key());
        Ok(())
    }

    // Reveal and determine winner
    pub fn resolve_game(ctx: Context<ResolveGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let house = &ctx.accounts.house;

        // Validate game state
        require!(game.state == GameState::InProgress, ErrorCode::GameNotInProgress);

        // Generate random winner using blockhash + game state
        let clock = Clock::get()?;
        let slot_hash = clock.slot.to_le_bytes();
        let random_seed = u64::from_le_bytes([
            slot_hash[0], slot_hash[1], slot_hash[2], slot_hash[3],
            slot_hash[4], slot_hash[5], slot_hash[6], slot_hash[7],
        ]);

        // 50/50 chance
        let winner = if random_seed % 2 == 0 {
            game.player1
        } else {
            game.player2
        };

        game.winner = winner;
        game.state = GameState::Finished;

        // Calculate payout (pot - house fee)
        let total_pot = game.pot;
        let house_fee = game.house_fee * 2; // 5% of both bets
        let payout = total_pot - house_fee;

        // Transfer house fee
        **game.to_account_info().try_borrow_mut_lamports()? -= house_fee;
        **house.to_account_info().try_borrow_mut_lamports()? += house_fee;

        // Transfer payout to winner
        **game.to_account_info().try_borrow_mut_lamports()? -= payout;
        if winner == game.player1 {
            **ctx.accounts.player1.to_account_info().try_borrow_mut_lamports()? += payout;
        } else {
            **ctx.accounts.player2.to_account_info().try_borrow_mut_lamports()? += payout;
        }

        msg!("Winner: {}, Payout: {} lamports", winner, payout);
        Ok(())
    }
}

// Account structures
#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + Game::LEN,
        seeds = [b"game", player.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,

    /// CHECK: House wallet address (receives fees)
    #[account(mut, address = Pubkey::from_str("HouseWalletAddress111111111111111111111111").unwrap())]
    pub house: AccountInfo<'info>,

    /// CHECK: Player 1 account
    #[account(mut)]
    pub player1: AccountInfo<'info>,

    /// CHECK: Player 2 account
    #[account(mut)]
    pub player2: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// Game state account
#[account]
pub struct Game {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub bet_amount: u64,
    pub pot: u64,
    pub house_fee: u64,
    pub winner: Pubkey,
    pub state: GameState,
    pub created_at: i64,
    pub bump: u8,
}

impl Game {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 32 + 1 + 8 + 1;
}

// Game states
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameState {
    WaitingForOpponent,
    InProgress,
    Finished,
    Cancelled,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid bet amount")]
    InvalidBetAmount,
    #[msg("Bet too small (min 0.00001 SOL)")]
    BetTooSmall,
    #[msg("Game not waiting for opponent")]
    GameNotWaiting,
    #[msg("Cannot play against yourself")]
    CannotPlaySelf,
    #[msg("Game not in progress")]
    GameNotInProgress,
}

