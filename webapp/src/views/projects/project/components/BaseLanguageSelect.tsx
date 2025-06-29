import React, { FC, ReactNode, useEffect } from 'react';
import { Box, MenuItem } from '@mui/material';
import { useFormikContext } from 'formik';

import { Select } from 'tg.component/common/form/fields/Select';
import { LanguageValue } from 'tg.component/languages/LanguageValue';
import { components } from 'tg.service/apiSchema.generated';
import { FieldLabel } from 'tg.component/FormField';

type LanguageModel = components['schemas']['LanguageModel'];

export const BaseLanguageSelect: FC<{
  languages: Partial<LanguageModel>[];
  label?: ReactNode;
  name: string;
  valueKey?: React.KeyOf<LanguageModel>;
  minHeight?: boolean;
  disabled?: boolean;
}> = (props) => {
  const availableLanguages = props.languages.filter((l) => !!l);
  const context = useFormikContext();
  const value = context.getFieldProps(props.name).value;
  const valueKey = props.valueKey || 'id';
  const minHeight = props.minHeight || false;

  useEffect(() => {
    if (value) {
      if (availableLanguages.findIndex((l) => l![valueKey] === value) === -1) {
        context.setFieldValue(props.name, '');
      }
    } else {
      const firstLanguage = availableLanguages[0];
      if (firstLanguage) {
        context.setFieldValue(props.name, firstLanguage[valueKey]);
      }
    }
  }, [value, availableLanguages]);

  return (
    <Box>
      <FieldLabel>{props.label}</FieldLabel>
      <Select
        data-cy="base-language-select"
        sx={{ mt: 0 }}
        name={props.name}
        size="small"
        minHeight={minHeight}
        disabled={props.disabled}
        renderValue={(v) => {
          const language = availableLanguages.find(
            (lang) => lang![valueKey] === v
          );
          return language && <LanguageValue language={language} />;
        }}
      >
        {availableLanguages.map((l, index) => (
          <MenuItem key={index} value={l![valueKey] as React.Key}>
            <LanguageValue language={l!} />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
