// The Basement - LuckyBlock Solana Program
// Multi-player jackpot game - mirrors Base network functionality

use anchor_lang::prelude::*;
use anchor_lang::system_program;

// House wallet address (same as Base network)
// Base: 0x5Da407f983e0f11B3f7F67Acd64877b42B22068D
// Solana equivalent (will be derived)
declare_id!("11111111111111111111111111111111"); // Update after deployment

const HOUSE_FEE_BPS: u16 = 500; // 5% house fee (same as Base)
const MIN_PLAYERS: u8 = 2; // Game starts at 2 players (same as Base)
const MAX_PLAYERS: u8 = 20; // Max 20 players (same as Base)
const ROUND_DURATION: i64 = 60; // 60 seconds once 2+ players (same as Base)

#[program]
pub mod luckyblock {
    use super::*;

    // Initialize the game (called once)
    pub fn initialize(ctx: Context<Initialize>, house_wallet: Pubkey) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = ctx.accounts.authority.key();
        game_state.house_wallet = house_wallet;
        game_state.current_round = 1;
        game_state.total_wagered = 0;
        game_state.total_rounds = 0;
        game_state.unique_players = 0;
        game_state.wager_count = 0;
        game_state.bump = ctx.bumps.game_state;
        
        msg!("LuckyBlock initialized with house wallet: {}", house_wallet);
        Ok(())
    }

    // Create a new round
    pub fn create_round(ctx: Context<CreateRound>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        round.id = game_state.current_round;
        round.state = RoundState::Open;
        round.pot = 0;
        round.player_count = 0;
        round.start_time = clock.unix_timestamp;
        round.end_time = 0; // Will be set when 2nd player joins
        round.winner = Pubkey::default();
        round.total_fees = 0;
        round.bump = ctx.bumps.round;

        msg!("Round {} created", round.id);
        Ok(())
    }

    // Enter round with bet (LIVE GAME - works like Base)
    pub fn enter_round(ctx: Context<EnterRound>, referrer: Option<Pubkey>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let game_state = &mut ctx.accounts.game_state;
        let player = &ctx.accounts.player;
        let player_data = &mut ctx.accounts.player_data;
        let clock = Clock::get()?;

        // Validations (same as Base contract)
        require!(round.state == RoundState::Open, ErrorCode::RoundNotOpen);
        require!(round.player_count < MAX_PLAYERS, ErrorCode::RoundFull);
        require!(ctx.accounts.player_entry.amount > 0, ErrorCode::InvalidBetAmount);

        // Check if already entered
        require!(!player_data.entered_current_round, ErrorCode::AlreadyEntered);

        let bet_amount = ctx.accounts.player_entry.amount;

        // Calculate fee (5% same as Base)
        let fee = (bet_amount as u128 * HOUSE_FEE_BPS as u128 / 10_000) as u64;
        let to_pot = bet_amount - fee;

        // Handle affiliate (20% of fee to referrer, 80% to house - same as Base)
        if let Some(ref_pubkey) = referrer {
            if ref_pubkey != player.key() && ref_pubkey != Pubkey::default() {
                let affiliate_cut = fee / 5; // 20%
                let house_cut = fee - affiliate_cut;

                // Transfer affiliate cut
                **ctx.accounts.player_entry.to_account_info().try_borrow_mut_lamports()? -= affiliate_cut;
                **ctx.accounts.referrer_account.to_account_info().try_borrow_mut_lamports()? += affiliate_cut;

                // Transfer house cut
                **ctx.accounts.player_entry.to_account_info().try_borrow_mut_lamports()? -= house_cut;
                **ctx.accounts.house.to_account_info().try_borrow_mut_lamports()? += house_cut;

                msg!("Affiliate fee: {} lamports", affiliate_cut);
            } else {
                // All fee to house
                **ctx.accounts.player_entry.to_account_info().try_borrow_mut_lamports()? -= fee;
                **ctx.accounts.house.to_account_info().try_borrow_mut_lamports()? += fee;
            }
        } else {
            // No referrer - all fee to house
            **ctx.accounts.player_entry.to_account_info().try_borrow_mut_lamports()? -= fee;
            **ctx.accounts.house.to_account_info().try_borrow_mut_lamports()? += fee;
        }

        // Add bet to pot
        **ctx.accounts.player_entry.to_account_info().try_borrow_mut_lamports()? -= to_pot;
        **round.to_account_info().try_borrow_mut_lamports()? += to_pot;

        // Update round state
        round.pot += to_pot;
        round.player_count += 1;
        round.total_fees += fee;

        // Start 60-second timer when 2nd player joins (SAME AS BASE!)
        if round.player_count == MIN_PLAYERS {
            round.end_time = clock.unix_timestamp + ROUND_DURATION;
            msg!("Round activated! 60 seconds until drawing");
        }

        // Mark player as entered
        player_data.entered_current_round = true;
        player_data.rounds_played += 1;

        // Update global stats
        game_state.total_wagered += bet_amount;
        game_state.wager_count += 1;

        // Auto-draw if max players reached (SAME AS BASE!)
        if round.player_count == MAX_PLAYERS {
            msg!("Max players reached - drawing winner");
            // Winner will be drawn in separate transaction
        }

        emit!(PlayerEntered {
            round_id: round.id,
            player: player.key(),
            entry_number: round.player_count,
            bet_amount,
            referrer,
        });

        Ok(())
    }

    // Draw winner (can be called by anyone after round ends or max players)
    pub fn draw_winner(ctx: Context<DrawWinner>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let game_state = &mut ctx.accounts.game_state;
        let clock = Clock::get()?;

        // Validations (same as Base)
        require!(round.state == RoundState::Open, ErrorCode::RoundNotOpen);
        require!(round.player_count >= MIN_PLAYERS, ErrorCode::NotEnoughPlayers);
        require!(
            clock.unix_timestamp >= round.end_time || round.player_count == MAX_PLAYERS,
            ErrorCode::RoundStillActive
        );

        round.state = RoundState::Drawing;

        // Generate random seed (similar to Base using blockhash)
        let random_seed = clock.unix_timestamp
            .wrapping_mul(clock.slot as i64)
            .wrapping_add(round.pot as i64)
            .wrapping_add(round.player_count as i64);

        // Winner selection happens in resolve_round
        round.random_seed = random_seed as u64;

        msg!("Drawing winner for round {}", round.id);
        Ok(())
    }

    // Resolve round and pay winner
    pub fn resolve_round(ctx: Context<ResolveRound>, winner_index: u8) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let game_state = &mut ctx.accounts.game_state;
        let winner_data = &mut ctx.accounts.winner_data;

        require!(round.state == RoundState::Drawing, ErrorCode::InvalidState);
        require!(winner_index < round.player_count, ErrorCode::InvalidWinner);

        // Set winner
        round.winner = ctx.accounts.winner.key();
        round.state = RoundState::Settled;

        // Update stats
        winner_data.rounds_won += 1;
        game_state.total_rounds += 1;

        // Pay winner
        let payout = round.pot;
        **round.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += payout;

        emit!(WinnerDrawn {
            round_id: round.id,
            winner: round.winner,
            payout,
            random_seed: round.random_seed,
        });

        // Increment round counter
        game_state.current_round += 1;

        msg!("Winner: {}, Payout: {} lamports", round.winner, payout);
        Ok(())
    }
}

// Account Structures

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::LEN,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateRound<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,

    #[account(
        init,
        payer = authority,
        space = 8 + Round::LEN,
        seeds = [b"round", game_state.current_round.to_le_bytes().as_ref()],
        bump
    )]
    pub round: Account<'info, Round>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EnterRound<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(mut)]
    pub game_state: Account<'info, GameState>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PlayerData::LEN,
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_data: Account<'info, PlayerData>,

    #[account(mut)]
    pub player: Signer<'info>,

    /// CHECK: Player's entry account (holds their bet)
    #[account(mut)]
    pub player_entry: AccountInfo<'info>,

    /// CHECK: House wallet (receives fees)
    #[account(mut)]
    pub house: AccountInfo<'info>,

    /// CHECK: Optional referrer account
    #[account(mut)]
    pub referrer_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(mut)]
    pub game_state: Account<'info, GameState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveRound<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,

    #[account(mut)]
    pub game_state: Account<'info, GameState>,

    #[account(mut)]
    pub winner_data: Account<'info, PlayerData>,

    /// CHECK: Winner account
    #[account(mut)]
    pub winner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// Data Structures

#[account]
pub struct GameState {
    pub authority: Pubkey,
    pub house_wallet: Pubkey,
    pub current_round: u64,
    pub total_wagered: u64,
    pub total_rounds: u64,
    pub unique_players: u64,
    pub wager_count: u64,
    pub bump: u8,
}

impl GameState {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Round {
    pub id: u64,
    pub state: RoundState,
    pub pot: u64,
    pub player_count: u8,
    pub start_time: i64,
    pub end_time: i64,
    pub winner: Pubkey,
    pub random_seed: u64,
    pub total_fees: u64,
    pub bump: u8,
}

impl Round {
    pub const LEN: usize = 8 + 1 + 8 + 1 + 8 + 8 + 32 + 8 + 8 + 1;
}

#[account]
pub struct PlayerData {
    pub player: Pubkey,
    pub rounds_played: u64,
    pub rounds_won: u64,
    pub entered_current_round: bool,
    pub bump: u8,
}

impl PlayerData {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 1;
}

// Enums

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RoundState {
    Open,      // Accepting entries
    Drawing,   // Drawing winner
    Settled,   // Winner paid
    Cancelled, // Cancelled
}

// Events

#[event]
pub struct PlayerEntered {
    pub round_id: u64,
    pub player: Pubkey,
    pub entry_number: u8,
    pub bet_amount: u64,
    pub referrer: Option<Pubkey>,
}

#[event]
pub struct WinnerDrawn {
    pub round_id: u64,
    pub winner: Pubkey,
    pub payout: u64,
    pub random_seed: u64,
}

// Errors

#[error_code]
pub enum ErrorCode {
    #[msg("Round is not open for entries")]
    RoundNotOpen,
    #[msg("Round is full (max 20 players)")]
    RoundFull,
    #[msg("Invalid bet amount")]
    InvalidBetAmount,
    #[msg("Player already entered this round")]
    AlreadyEntered,
    #[msg("Not enough players (min 2)")]
    NotEnoughPlayers,
    #[msg("Round still active")]
    RoundStillActive,
    #[msg("Invalid round state")]
    InvalidState,
    #[msg("Invalid winner index")]
    InvalidWinner,
}

