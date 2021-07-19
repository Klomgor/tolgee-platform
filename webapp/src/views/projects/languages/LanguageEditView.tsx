import { Box, Button } from '@material-ui/core';
import { useTranslate, T } from '@tolgee/react';
import { useRouteMatch } from 'react-router-dom';
import { container } from 'tsyringe';

import { ConfirmationDialogProps } from 'tg.component/common/ConfirmationDialog';
import { LanguageModifyFields } from 'tg.component/languages/LanguageModifyFields';
import { BaseFormView } from 'tg.component/layout/BaseFormView';
import { Validation } from 'tg.constants/GlobalValidationSchema';
import { LINKS, PARAMS } from 'tg.constants/links';
import { confirmation } from 'tg.hooks/confirmation';
import { useRedirect } from 'tg.hooks/useRedirect';
import { MessageService } from 'tg.service/MessageService';
import { components } from 'tg.service/apiSchema.generated';
import { useApiMutation, useApiQuery } from 'tg.service/http/useQueryApi';
import { Navigation } from 'tg.component/navigation/Navigation';
import { useProject } from 'tg.hooks/useProject';

type LanguageModel = components['schemas']['LanguageModel'];

const messageService = container.resolve(MessageService);

export const LanguageEditView = () => {
  const confirmationMessage = (options: ConfirmationDialogProps) =>
    confirmation({ title: 'Delete language', ...options });

  const match = useRouteMatch();
  const project = useProject();
  const t = useTranslate();

  const projectId = match.params[PARAMS.PROJECT_ID];
  const languageId = match.params[PARAMS.LANGUAGE_ID] as number;

  const languageLoadable = useApiQuery({
    url: '/v2/projects/{projectId}/languages/{languageId}',
    method: 'get',
    path: { projectId, languageId },
    options: {
      cacheTime: 0,
    },
  });
  const editLoadable = useApiMutation({
    url: '/v2/projects/{projectId}/languages/{languageId}',
    method: 'put',
  });
  const deleteLoadable = useApiMutation({
    url: '/v2/projects/{projectId}/languages/{languageId}',
    method: 'delete',
  });

  const onSubmit = (values: LanguageModel) => {
    const { name, originalName, flagEmoji, tag } = values;
    editLoadable.mutate(
      {
        path: {
          projectId: projectId,
          languageId: languageId,
        },
        content: {
          'application/json': {
            name,
            originalName: originalName as string,
            tag,
            flagEmoji,
          },
        },
      },
      {
        onSuccess() {
          messageService.success(<T>language_edited_message</T>);
          useRedirect(LINKS.PROJECT_EDIT, {
            [PARAMS.PROJECT_ID]: projectId,
          });
        },
      }
    );
  };

  const onDelete = () => {
    deleteLoadable.mutate(
      {
        path: {
          projectId: projectId,
          languageId: languageId,
        },
      },
      {
        onSuccess() {
          messageService.success(<T>language_deleted_message</T>);
          useRedirect(LINKS.PROJECT_EDIT, {
            [PARAMS.PROJECT_ID]: projectId,
          });
        },
      }
    );
  };

  return (
    <BaseFormView
      lg={6}
      md={8}
      xs={10}
      navigation={
        <Navigation
          path={[
            [
              project.name,
              LINKS.PROJECT_TRANSLATIONS.build({
                [PARAMS.PROJECT_ID]: project.id,
              }),
            ],
            [
              t('project_settings_title'),
              LINKS.PROJECT_EDIT.build({
                [PARAMS.PROJECT_ID]: project.id,
              }),
            ],
            [
              t('language_settings_title'),
              LINKS.PROJECT_EDIT_LANGUAGE.build({
                [PARAMS.PROJECT_ID]: project.id,
                [PARAMS.LANGUAGE_ID]: languageId,
              }),
            ],
          ]}
        />
      }
      initialValues={{
        ...languageLoadable.data!,
        flagEmoji: languageLoadable.data?.flagEmoji || '🏁',
        originalName: languageLoadable.data?.originalName || '',
      }}
      onSubmit={onSubmit}
      loading={
        languageLoadable.isFetching ||
        editLoadable.isLoading ||
        deleteLoadable.isLoading
      }
      hideChildrenOnLoading={languageLoadable.isLoading}
      validationSchema={Validation.LANGUAGE}
      customActions={
        <Button
          variant="outlined"
          color="secondary"
          data-cy="language-delete-button"
          onClick={() => {
            if (languageLoadable.data?.base) {
              return messageService.error(
                <T>cannot_delete_base_language_message</T>
              );
            }
            confirmationMessage({
              message: (
                <T parameters={{ name: languageLoadable.data!.name }}>
                  delete_language_confirmation
                </T>
              ),
              hardModeText: languageLoadable.data!.name.toUpperCase(),
              confirmButtonText: <T>global_delete_button</T>,
              confirmButtonColor: 'secondary',
              onConfirm: onDelete,
            });
          }}
        >
          <T>delete_language_button</T>
        </Button>
      }
    >
      <Box data-cy="language-modify-form">
        <LanguageModifyFields />
      </Box>
    </BaseFormView>
  );
};