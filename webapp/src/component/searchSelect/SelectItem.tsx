import { ListItemText, MenuItemProps, styled } from '@mui/material';
import React from 'react';
import { CompactMenuItem } from 'tg.component/ListComponents';

const StyledMenuItem = styled(CompactMenuItem)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;

  & .hidden {
    opacity: 0;
    transition: opacity ease-in 0.1s;
  }

  &:hover .hidden {
    opacity: 1;
  }

  gap: 8px;
`;

const StyledListItemText = styled(ListItemText)`
  overflow: hidden;
`;

type Props = MenuItemProps & {
  label: React.ReactNode;
  selected: boolean;
};

export const SelectItem = React.forwardRef(function SelectItem(
  { label, selected, ...other }: Props,
  ref
) {
  return (
    <StyledMenuItem
      ref={ref as any}
      data-cy="filter-item"
      selected={selected}
      {...other}
    >
      <StyledListItemText primary={label} />
    </StyledMenuItem>
  );
});
