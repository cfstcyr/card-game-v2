import styles from './page-home.module.scss';
import React from 'react';
import { ActionButton } from '../../components/action-button/action-button';
import { useGameData } from '../../contexts';
import { GameCard } from '../../components/game-card/game-card';
import { PageLayout } from '../../components/page-layout/page-layout';

export const PageHome: React.FC = () => {
    const { games, fetchGames } = useGameData();

    return (
        <PageLayout
            top={
                <div className={styles['page-home__header']}>
                    <h1 className={styles['page-home__title']}>Card Games</h1>
                    <div className={styles['page-home__actions']}>
                        <ActionButton
                            icon={{ icon: 'sync' }}
                            onClick={fetchGames}
                        />
                    </div>
                </div>
            }
        >
            <div className={styles['page-home__games-container']}>
                <div className={styles['page-home__games']}>
                    {games.error ? (
                        <p>Error loading games</p>
                    ) : (
                        Object.values(games).map(
                            (game) =>
                                game &&
                                game.value && (
                                    <GameCard
                                        key={game.value.id}
                                        game={game.value}
                                        className={styles['page-home__game']}
                                    />
                                ),
                        )
                    )}
                </div>
            </div>
        </PageLayout>
    );
};
