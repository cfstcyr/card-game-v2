import styles from './page-game.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../models/card';
import { shuffle } from '../../utils/random';
import { SimpleButton } from '../../components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Swiper as SwiperClass } from 'swiper';
import { useKeys } from '../../hooks/useKeys';
import { GameSlide } from '../../components/game-slide/game-slide';
import { ActionButton } from '../../components/action-button/action-button';
import { useData, useEvent } from '../../contexts';

export const PageGame: React.FC = () => {
    const keys = useKeys();
    const { id } = useParams();
    const { next } = useEvent();
    const swiper = useRef<SwiperClass>();
    const copyToClipboardButton = useRef<HTMLDivElement>(null);
    const { games, cards, fetchCards } = useData();
    const [gameCards, setGameCards] = useState<
        Omit<Card, 'gameId'>[] | undefined
    >();
    const [cardsLoading, setCardsLoading] = useState<boolean>(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);

    useEffect(() => {
        if (id && !cards[id]) {
            setCardsLoading(true);
            fetchCards(id).finally(() => setCardsLoading(false));
        }
    }, [id, cards]);

    useEffect(() => {
        setGameCards(id && cards[id] ? shuffle(cards[id].value) : []);
    }, [cards]);

    useEffect(() => {
        const off = keys.event.on('down', (arrow) => {
            switch (arrow) {
                case 'left':
                    swiper.current?.slidePrev();
                    break;
                case 'right':
                    swiper.current?.slideNext();
                    break;
            }
        });

        return () => off();
    }, [keys, swiper]);

    // const copyToClipboard = useCallback(() => {
    //     const content = gameCards?.[slideIndex];
    //     if (content) {
    //         navigator.clipboard.writeText(content.content);
    //     }

    //     if (copyToClipboardButton.current) {
    //         next('action-popup', {
    //             children: 'Copied to clipboard!',
    //             posX: copyToClipboardButton.current.offsetLeft,
    //             posY: copyToClipboardButton.current.offsetTop,
    //         });
    //     }
    // }, [gameCards, slideIndex]);

    const share = useCallback(() => {
        if (!id || !games[id]?.value) return;

        const content = gameCards?.[slideIndex];

        if (!content) return;

        const data = {
            text: content.content,
            title: games[id]?.value?.name,
        };

        if (navigator.canShare(data)) {
            navigator.share(data);
        }
    }, [gameCards, slideIndex, id, games]);

    return games.loading || cardsLoading ? (
        <p>loading</p>
    ) : (
        <div className={styles['page-game']}>
            <div className="page-game__top d:flex p:24 align-items:center justify-content:space-between">
                <div className="page-game__buttons d:flex">
                    <SimpleButton
                        icon={{ icon: 'times', styling: 'solid' }}
                        to="/"
                        color={id && games[id]?.value?.color}
                    />
                </div>
                {/* <div>
                    <p className="m:0 opacity:0.55 f:bold no-select">
                        {Math.min(slideIndex + 1, totalSlides - 1)}
                        {'/'}
                        {totalSlides - 1}
                    </p>
                </div> */}
                {/* <div className="d:flex gap:3">
                    <div ref={copyToClipboardButton}>
                        <ActionButton
                            icon={{ icon: 'clipboard', styling: 'solid' }}
                            onClick={copyToClipboard}
                        />
                    </div>
                </div> */}
            </div>
            <div className={styles['page-game__game']}>
                {id && gameCards && (
                    <Swiper
                        className={styles['page-game__swiper']}
                        effect="cards"
                        modules={[EffectCards]}
                        grabCursor
                        spaceBetween={50}
                        onBeforeInit={(s) => {
                            swiper.current = s;
                            setTotalSlides(s.slides.length);
                            setSlideIndex(s.activeIndex);
                        }}
                        onSlidesLengthChange={(s) => {
                            setTotalSlides(s.slides.length);
                        }}
                        onSlideChange={(s) => {
                            setSlideIndex(s.activeIndex);
                        }}
                    >
                        {games.error || cards[id].error ? (
                            <SwiperSlide>
                                <GameSlide isSystemSlide>
                                    <p>
                                        {games[id]?.errorStatus === 404 ||
                                        cards[id].errorStatus === 404
                                            ? 'Game not found'
                                            : 'Error loading game'}
                                    </p>
                                </GameSlide>
                            </SwiperSlide>
                        ) : (
                            <>
                                {gameCards.map((card) => (
                                    <SwiperSlide key={card.id}>
                                        <GameSlide>{card.content}</GameSlide>
                                    </SwiperSlide>
                                ))}
                                <SwiperSlide>
                                    <GameSlide isSystemSlide>
                                        All done
                                    </GameSlide>
                                </SwiperSlide>
                            </>
                        )}
                    </Swiper>
                )}
            </div>
            <div className="page-game__bottom">
                <div className="d:flex padding:24 mb:12 gap:12 justify-content:space-between">
                    <div className="d:flex">
                        <SimpleButton
                            icon={{ icon: 'arrow-left', styling: 'solid' }}
                            onClick={() => swiper.current?.slidePrev()}
                            disabled={slideIndex === 0}
                            color={id && games[id]?.value?.color}
                        />
                        <SimpleButton
                            icon={{ icon: 'arrow-right', styling: 'solid' }}
                            onClick={() => swiper.current?.slideNext()}
                            disabled={slideIndex === totalSlides - 1}
                            color={id && games[id]?.value?.color}
                        />
                    </div>

                    <p className="opacity:0.55 font-weight:600">
                        {totalSlides -
                            1 -
                            Math.min(slideIndex + 1, totalSlides - 1)}{' '}
                        cards left
                    </p>

                    {navigator.canShare({ text: '', title: '' }) && (
                        <SimpleButton
                            icon={{ icon: 'share', styling: 'solid' }}
                            color={id && games[id]?.value?.color}
                            onClick={share}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
