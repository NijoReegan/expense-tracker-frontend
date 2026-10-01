export default function Icon({ name, size, fill, className = '', ...props }) {
  const classes = ['material-symbols-outlined', fill ? 'material-symbols-fill' : '', className]
    .filter(Boolean)
    .join(' ');
  const style = size ? { fontSize: size } : undefined;
  return (
    <span className={classes} style={style} aria-hidden="true" {...props}>
      {name}
    </span>
  );
}