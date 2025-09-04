import React, { forwardRef, InputHTMLAttributes, useId } from 'react';

import './FormCheckbox.scss';

type FormCheckboxType = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    hideLabel?: boolean;
    emptyItem?: boolean;
    item: {
        label: string;
        value: string;
        checked?: boolean;
    };
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxType>((
    {
        label,
        name,
        hideLabel,
        emptyItem,
        item,
        ...rest
    },
    ref,
) => {
    const uid = useId();

    return (
        <div className='checkbox'>
            {label && !hideLabel && <label className='checkbox__label'>{label}</label>}
            <div className={`checkbox__item ${!emptyItem ? "checkbox__item--nolabel" : ""}`}>
                <input ref={ref} type='checkbox' name={name} id={uid} value={item.value} defaultChecked={item.checked} {...rest} />
                {emptyItem ? (
                    <label htmlFor={uid} className="checkbox__item--nolabel" />
                ) : (
                    <label htmlFor={uid}>{item.label}</label>
                )}
            </div>
        </div>
    );
});

export default FormCheckbox;
