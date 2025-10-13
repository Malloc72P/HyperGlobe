import { CustomLinkModel } from './custom-link-model';
import classes from './custom-link.module.css';

export function CustomLink({ link }: { link: CustomLinkModel }) {
  return (
    <a
      href="#"
      className={classes.link}
      style={{
        color: link.color,
      }}
      onClick={(e) => {
        e.preventDefault();
        link.onClick && link.onClick();
      }}
    >
      {link.icon && <link.icon className={classes.icon} size={16} stroke={1.5} />}
      {link.label}
    </a>
  );
}
