import { AxiosError } from 'axios';
import React, { PropsWithChildren, useCallback, useEffect } from 'react';
import { useDataMap } from '../../hooks/useDataMap';
import { Card } from '../../models/card';
import { Data } from '../../models/data';
import { GameListItem, GameWithCards } from '../../models/game';
import { useApi } from '../api-context';
import { useLoadingBar } from '../loading-bar-context';
import { DataContext } from './context';

export const GameDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { continuousStart, complete } = useLoadingBar();
    const { get } = useApi();
    const games = useDataMap<GameListItem>(undefined);
    const cards = useDataMap<Omit<Card, 'gameId'>[]>([]);

    useEffect(() => {
        if (games.isLoading || cards.isLoading) {
            continuousStart?.();
        } else {
            complete?.();
        }
    }, [games.isLoading, cards.isLoading, continuousStart, complete]);

    const fetchGames = useCallback(async () => {
        games.setLoadingAll(true);

        try {
            const res = await get<GameListItem[]>('/game');

            for (const game of res.data) {
                games.setValue(String(game.id), game);
            }
        } catch (e) {
            let status: number | undefined = undefined;
            if (e instanceof AxiosError) {
                status = e.response?.status;
            }

            games.setErrorAll(String(e), status);
        }

        games.setLoadingAll(false);
    }, []);

    const fetchCards = useCallback(async (gameId: string) => {
        cards.setLoading(gameId, true);

        try {
            const res = await get<GameWithCards>(`/game/${gameId}`);
            cards.setValue(gameId, res.data.cards);
        } catch (e) {
            let status: number | undefined = undefined;
            if (e instanceof AxiosError) {
                status = e.response?.status;
            }
            cards.setError(gameId, String(e), status);
        }

        cards.setLoading(gameId, false);
    }, []);

    const getGame = useCallback(
        (gameId: string): Data<GameListItem> | undefined => {
            return games.get(gameId);
        },
        [games],
    );

    const getGameCards = useCallback(
        (gameId: string): Data<Omit<Card, 'gameId'>[]> | undefined => {
            return cards.get(gameId);
        },
        [cards],
    );

    useEffect(() => {
        fetchGames();
    }, []);

    return (
        <DataContext.Provider
            value={{
                games: games.self,
                cards: cards.self,
                getGame,
                getGameCards,
                isGamesLoading: games.isLoading,
                isCardsLoading: games.isLoading,
                fetchGames,
                fetchCards,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
