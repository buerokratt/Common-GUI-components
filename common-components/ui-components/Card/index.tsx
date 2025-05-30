import React, { FC, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

import './Card.scss';

type CardProps = {
    header?: ReactNode;
    footer?: ReactNode;
    borderless?: boolean;
    isHeaderLight?: boolean;
    isBodyDivided?: boolean;
    isScrollable?: boolean;
};

const Card: FC<PropsWithChildren<CardProps>> = ({
                                                    header,
                                                    footer,
                                                    borderless,
                                                    isHeaderLight,
                                                    isBodyDivided,
                                                    isScrollable = false,
                                                    children,
                                                }) => {
    return (
        <div className={clsx('card', { 'card--borderless': borderless, 'card--scrollable': isScrollable })}>
            {header && (
                <div className={`card__header ${isHeaderLight ? 'white' : ''}`}>
                    {header}
                </div>
            )}
            <div className={`card__body ${isBodyDivided ? 'divided' : ''}`}>
                {children}
            </div>
            {footer && <div className="card__footer">{footer}</div>}
        </div>
    );
};

export default Card;
