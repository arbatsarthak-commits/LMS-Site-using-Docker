import React from 'react'

/**
 * Floating label text input. Use placeholder=" " for CSS :placeholder-shown.
 */
export function FloatingInput({
  id,
  label,
  error,
  className = '',
  inputClassName = '',
  ...inputProps
}) {
  const invalid = Boolean(error)
  return (
    <div className={`floatField ${invalid ? 'floatField--invalid' : ''} ${className}`.trim()}>
      <input
        id={id}
        className={`input floatInput ${inputClassName}`.trim()}
        placeholder=" "
        aria-invalid={invalid}
        aria-describedby={error ? `${id}-err` : undefined}
        {...inputProps}
      />
      <label className="floatLabel" htmlFor={id}>
        {label}
      </label>
      {error ? (
        <span id={`${id}-err`} className="fieldError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Floating label for select — pass filled when value is non-empty for label position.
 */
export function FloatingSelect({
  id,
  label,
  error,
  children,
  className = '',
  selectClassName = '',
  value,
  ...selectProps
}) {
  const invalid = Boolean(error)
  const filled = value !== undefined && value !== null && String(value).length > 0
  return (
    <div
      className={`floatField floatField--select ${invalid ? 'floatField--invalid' : ''} ${filled ? 'floatField--filled' : ''} ${className}`.trim()}
    >
      <select
        id={id}
        className={`input floatInput floatSelect ${selectClassName}`.trim()}
        value={value}
        aria-invalid={invalid}
        aria-describedby={error ? `${id}-err` : undefined}
        {...selectProps}
      >
        {children}
      </select>
      <label className="floatLabel" htmlFor={id}>
        {label}
      </label>
      {error ? (
        <span id={`${id}-err`} className="fieldError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Icon + floating input in one bordered control (login-style).
 */
export function FloatingInputIconRow({
  id,
  label,
  error,
  icon,
  className = '',
  inputProps = {},
}) {
  const invalid = Boolean(error)
  const val = inputProps.value
  const filled =
    val !== undefined && val !== null && String(val).trim().length > 0
  return (
    <div
      className={`floatField floatField--iconRow ${invalid ? 'floatField--invalid' : ''} ${filled ? 'floatField--filled' : ''} ${className}`.trim()}
    >
      <div className="inputIconWrap floatIconWrap">
        <span className="inputIcon" aria-hidden>
          {icon}
        </span>
        <input
          id={id}
          className="input floatInput floatInput--inIcon"
          placeholder=" "
          aria-invalid={invalid}
          aria-describedby={error ? `${id}-err` : undefined}
          {...inputProps}
        />
      </div>
      <label className="floatLabel floatLabel--iconRow" htmlFor={id}>
        {label}
      </label>
      {error ? (
        <span id={`${id}-err`} className="fieldError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
