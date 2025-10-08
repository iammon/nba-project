-- CreateTable
CREATE TABLE "boxscores" (
    "game_id" BIGINT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "team_id" INTEGER,
    "minutes_raw" TEXT,
    "minutes_s" INTEGER,
    "fgm" INTEGER,
    "fga" INTEGER,
    "fg_pct" DECIMAL,
    "fg3m" INTEGER,
    "fg3a" INTEGER,
    "fg3_pct" DECIMAL,
    "ftm" INTEGER,
    "fta" INTEGER,
    "ft_pct" DECIMAL,
    "oreb" INTEGER,
    "dreb" INTEGER,
    "reb" INTEGER,
    "ast" INTEGER,
    "stl" INTEGER,
    "blk" INTEGER,
    "tov" INTEGER,
    "pf" INTEGER,
    "pts" INTEGER,
    "plus_minus" INTEGER,

    CONSTRAINT "boxscores_pkey" PRIMARY KEY ("game_id","player_id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" BIGINT NOT NULL,
    "season" INTEGER NOT NULL,
    "game_date" DATE NOT NULL,
    "home_team_id" INTEGER,
    "visitor_team_id" INTEGER,
    "home_points" INTEGER,
    "visitor_points" INTEGER,
    "home_team_wins" BOOLEAN,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_games" (
    "GAME_DATE_EST" TEXT,
    "GAME_ID" TEXT,
    "GAME_STATUS_TEXT" TEXT,
    "HOME_TEAM_ID" TEXT,
    "VISITOR_TEAM_ID" TEXT,
    "SEASON" TEXT,
    "TEAM_ID_home" TEXT,
    "PTS_home" TEXT,
    "FG_PCT_home" TEXT,
    "FT_PCT_home" TEXT,
    "FG3_PCT_home" TEXT,
    "AST_home" TEXT,
    "REB_home" TEXT,
    "TEAM_ID_away" TEXT,
    "PTS_away" TEXT,
    "FG_PCT_away" TEXT,
    "FT_PCT_away" TEXT,
    "FG3_PCT_away" TEXT,
    "AST_away" TEXT,
    "REB_away" TEXT,
    "HOME_TEAM_WINS" TEXT
);

-- CreateTable
CREATE TABLE "staging_games_details" (
    "GAME_ID" TEXT,
    "TEAM_ID" TEXT,
    "TEAM_ABBREVIATION" TEXT,
    "TEAM_CITY" TEXT,
    "PLAYER_ID" TEXT,
    "PLAYER_NAME" TEXT,
    "NICKNAME" TEXT,
    "START_POSITION" TEXT,
    "COMMENT" TEXT,
    "MIN" TEXT,
    "FGM" TEXT,
    "FGA" TEXT,
    "FG_PCT" TEXT,
    "FG3M" TEXT,
    "FG3A" TEXT,
    "FG3_PCT" TEXT,
    "FTM" TEXT,
    "FTA" TEXT,
    "FT_PCT" TEXT,
    "OREB" TEXT,
    "DREB" TEXT,
    "REB" TEXT,
    "AST" TEXT,
    "STL" TEXT,
    "BLK" TEXT,
    "TO" TEXT,
    "PF" TEXT,
    "PTS" TEXT,
    "PLUS_MINUS" TEXT
);

-- CreateTable
CREATE TABLE "staging_players" (
    "PLAYER_NAME" TEXT,
    "TEAM_ID" TEXT,
    "PLAYER_ID" TEXT,
    "SEASON" TEXT
);

-- CreateTable
CREATE TABLE "staging_teams" (
    "LEAGUE_ID" TEXT,
    "TEAM_ID" TEXT,
    "MIN_YEAR" TEXT,
    "MAX_YEAR" TEXT,
    "ABBREVIATION" TEXT,
    "NICKNAME" TEXT,
    "YEARFOUNDED" TEXT,
    "CITY" TEXT,
    "ARENA" TEXT,
    "ARENACAPACITY" TEXT,
    "OWNER" TEXT,
    "GENERALMANAGER" TEXT,
    "HEADCOACH" TEXT,
    "DLEAGUEAFFILIATION" TEXT
);

-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL,
    "abbreviation" TEXT,
    "nickname" TEXT,
    "city" TEXT,
    "min_year" INTEGER,
    "max_year" INTEGER,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "boxscores" ADD CONSTRAINT "boxscores_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "boxscores" ADD CONSTRAINT "boxscores_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "boxscores" ADD CONSTRAINT "boxscores_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_visitor_team_id_fkey" FOREIGN KEY ("visitor_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
