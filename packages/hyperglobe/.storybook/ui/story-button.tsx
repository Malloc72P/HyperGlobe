import classes from './story-button.module.css';

export interface StoryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function StoryButton({
  children,
  disabled,
  onClick,
  variant = 'primary',
}: StoryButtonProps) {
  return (
    <button className={classes.button} onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  );
}
