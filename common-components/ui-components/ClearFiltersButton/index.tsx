import { Button } from "@buerokratt-ria/header/src/components";
import { ComponentProps, FC } from "react";
import { useTranslation } from "react-i18next";
import { MdFilterListOff } from "react-icons/md";

type ClearFiltersButtonProps = {
  readonly onClick: () => void;
  readonly style?: Pick<ComponentProps<typeof Button>, 'style'>['style'];
}

const ClearFiltersButton: FC<ClearFiltersButtonProps> = ({ onClick, style }) => {
  const { t } = useTranslation();

  return <Button
    appearance="primary"
    size="s"
    style={style}
    onClick={onClick}>
    {t('global.clearFilters')}
    <MdFilterListOff style={{ height: '24px', width: '24px' }} />
  </Button>
};

export default ClearFiltersButton;
