import { useMemo } from 'react';
import {
  generatePlaceholdersStyle,
  getPlaceholders,
  Placeholder,
  Position,
} from '@tginternal/editor';
import { styled, useTheme } from '@mui/material';
import { getLanguageDirection } from 'tg.fixtures/getLanguageDirection';
import { placeholderToElement } from './placeholderToElement';
import { useProject } from 'tg.hooks/useProject';
import { useGlossaryTermHighlights } from 'tg.ee';
import { GlossaryTermHighlightModel } from '../../../../eeSetup/EeModuleType';
import { GlossaryHighlight } from 'tg.views/projects/translations/translationVisual/GlossaryHighlight';

const StyledWrapper = styled('div')`
  white-space: pre-wrap;
`;

type Props = {
  content: string;
  pluralExampleValue?: number | undefined;
  locale: string;
  targetLocale?: string;
  nested: boolean;
  showHighlights?: boolean;
};

type Modifier = {
  position: Position;
  placeholder?: Placeholder;
  highlight?: GlossaryTermHighlightModel;
};

function isOverlapping(a: Position, b: Position): boolean {
  return a.start <= b.end && a.end >= b.start;
}

function sortModifiers(
  placeholders: Placeholder[],
  highlights: GlossaryTermHighlightModel[]
): Modifier[] {
  let modifiers: Modifier[] = placeholders.map((placeholder) => ({
    position: placeholder.position,
    placeholder: placeholder,
  }));

  highlights.forEach((highlight) => {
    const overlappingModifiers = modifiers.filter(({ position }) =>
      isOverlapping(position, highlight.position)
    );

    // Add non-overlapping highlights
    if (overlappingModifiers.length === 0) {
      modifiers.push({
        position: highlight.position,
        highlight: highlight,
      });
      return;
    }

    // If there is an overlap with only shorter highlights, replace them with the longer one
    const highlightLength = highlight.position.end - highlight.position.start;
    const areAllOverlapsOnlyShorterHighlights = overlappingModifiers.every(
      (modifier) =>
        modifier.highlight &&
        modifier.position.end - modifier.position.start < highlightLength
    );

    if (areAllOverlapsOnlyShorterHighlights) {
      modifiers = modifiers.filter(
        ({ position }) => !isOverlapping(position, highlight.position)
      );
      modifiers.push({
        position: highlight.position,
        highlight: highlight,
      });
    }
  });

  return modifiers.sort((a, b) => a.position.start - b.position.start);
}

export const TranslationWithPlaceholders = ({
  content,
  pluralExampleValue,
  locale,
  targetLocale,
  nested,
  showHighlights,
}: Props) => {
  const project = useProject();
  const theme = useTheme();
  const direction = getLanguageDirection(locale);
  const placeholders = useMemo(() => {
    if (!project.icuPlaceholders) {
      return [];
    }
    return getPlaceholders(content || '', nested) || [];
  }, [content, nested]);

  const glossaryTerms = useGlossaryTermHighlights({
    text: content || '',
    languageTag: locale,
    enabled: showHighlights ?? false,
  });

  const modifiers = sortModifiers(placeholders, glossaryTerms);

  const StyledPlaceholdersWrapper = useMemo(() => {
    return generatePlaceholdersStyle({
      styled,
      colors: theme.palette.placeholders,
      component: StyledWrapper,
    });
  }, [theme.palette.placeholders]);

  const chunks: React.ReactNode[] = [];
  let index = 0;
  for (const modifier of modifiers) {
    if (modifier.position.start !== index) {
      chunks.push(content?.substring(index, modifier.position.start) ?? '');
    }
    index = modifier.position.end;
    if (modifier.placeholder) {
      chunks.push(
        placeholderToElement({
          placeholder: modifier.placeholder,
          pluralExampleValue,
          key: index,
        })
      );
    } else if (modifier.highlight) {
      const text =
        content?.substring(modifier.position.start, modifier.position.end) ??
        '';
      chunks.push(
        <GlossaryHighlight
          key={index}
          text={text}
          term={modifier.highlight.value}
          languageTag={locale}
          targetLanguageTag={targetLocale}
        />
      );
    }
  }

  if (index < (content || '').length) {
    chunks.push(content.substring(index));
  }

  return (
    <StyledPlaceholdersWrapper
      dir={direction}
      lang={locale}
      data-cy="translation-text"
    >
      {chunks}
    </StyledPlaceholdersWrapper>
  );
};
