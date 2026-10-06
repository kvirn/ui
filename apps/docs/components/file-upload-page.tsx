import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock, stringText } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  fileUploadActionsRows,
  fileUploadDropHintRows,
  fileUploadDropZoneAttributes,
  fileUploadDropZoneRows,
  fileUploadFileDetailRows,
  fileUploadInputRows,
  fileUploadItemAttributes,
  fileUploadItemButtonAttributes,
  fileUploadItemButtonRows,
  fileUploadItemErrorRows,
  fileUploadItemRows,
  fileUploadLimitsRows,
  fileUploadListRows,
  fileUploadPreviewRows,
  fileUploadProgressRows,
  fileUploadRejectionsRows,
  fileUploadRootAttributes,
  fileUploadRootRows,
  fileUploadStatusAttributes,
  fileUploadStatusRows,
  fileUploadStringKeys,
  fileUploadSummaryRows,
  fileUploadTriggerAttributes,
  fileUploadTriggerRows,
  useFileUploadHook,
} from '../content/file-upload.api.ts'
import { DefaultFileUpload } from '../examples/file-upload/default.tsx'
import { FailureReason } from '../examples/file-upload/failure-reason.tsx'
import { MissingFile } from '../examples/file-upload/missing-file.tsx'
import { OwnChecks } from '../examples/file-upload/own-checks.tsx'
import { SendWithForm } from '../examples/file-upload/send-with-form.tsx'
import { SingleFile } from '../examples/file-upload/single-file.tsx'
import { UploadYourself } from '../examples/file-upload/upload-yourself.tsx'
import type { Contract, ContractAnnouncementRow } from '../lib/contract-parser.ts'

export type FileUploadExampleSources = Record<
  | 'default'
  | 'send-with-form'
  | 'upload-yourself'
  | 'failure-reason'
  | 'own-checks'
  | 'single-file'
  | 'missing-file',
  string
>

// The contract describes the announcements in prose, so the page gives the rows, built from the
// same message keys. A contract that gains its own table wins.
const announcementRows: readonly ContractAnnouncementRow[] = [
  {
    event: 'One file is added by a drop. After the dialog, only refused files are counted.',
    messageKeys: ['fileAdded', 'filesAdded'],
    example: stringText('fileUpload', 'fileAdded', { name: 'report.pdf' }),
    politeness: 'polite',
  },
  {
    event: 'Files are refused',
    messageKeys: ['filesRejected'],
    example: stringText('fileUpload', 'filesRejected', { count: 2 }),
    politeness: 'polite',
  },
  {
    event: 'A file is removed',
    messageKeys: ['fileRemoved'],
    example: stringText('fileUpload', 'fileRemoved', { name: 'report.pdf' }),
    politeness: 'polite',
  },
  {
    event: 'The list becomes full',
    messageKeys: ['summaryFull'],
    example: stringText('fileUpload', 'summaryFull', { maxFiles: 5 }),
    politeness: 'polite',
  },
  {
    event: 'Uploads start with autoUpload off (uploadAll)',
    messageKeys: ['uploadsStarted'],
    example: stringText('fileUpload', 'uploadsStarted', { count: 3 }),
    politeness: 'polite',
  },
  {
    event: 'Uploads finish, after about a second of quiet',
    messageKeys: ['uploadComplete', 'uploadsComplete', 'allUploadsComplete'],
    example: stringText('fileUpload', 'uploadsComplete', { count: 3 }),
    politeness: 'polite',
  },
  {
    event: 'Uploads fail, after about a second of quiet',
    messageKeys: ['uploadFailed', 'uploadsFailed'],
    example: stringText('fileUpload', 'uploadsFailed', { count: 2 }),
    politeness: 'polite',
  },
  {
    event: 'Several FileUploads share the page: the message starts with the Field label',
    messageKeys: ['announcementForField'],
    example: stringText('fileUpload', 'announcementForField', {
      label: 'Attachments',
      message: '2 files uploaded.',
    }),
    politeness: 'polite',
  },
]

const parts: ApiPart[] = [
  {
    name: 'FileUpload.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> that holds every part, the list, the upload queue and the
        announcements. It takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it. Put it in a Field, so the Trigger gets its label. If you render no{' '}
        <code>FileUpload.Input</code>, it adds one. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: fileUploadRootRows,
    attributes: fileUploadRootAttributes,
  },
  {
    name: 'FileUpload.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>: the one control that adds files. It
        opens the system dialog, carries the Field’s control id, and its name is its text and then
        the Field label. It never has <code>aria-required</code>.
      </>
    ),
    props: fileUploadTriggerRows,
    attributes: fileUploadTriggerAttributes,
  },
  {
    name: 'FileUpload.Input',
    renders: (
      <>
        <code>&lt;input type=&quot;file&quot;&gt;</code>, visually hidden and out of the
        accessibility tree (<code>aria-hidden</code>, <code>tabindex=&quot;-1&quot;</code>, never{' '}
        <code>display: none</code>, never <code>required</code>). <code>accept</code> and{' '}
        <code>multiple</code> come from the Root.
      </>
    ),
    props: fileUploadInputRows,
  },
  {
    name: 'FileUpload.DropZone',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role that is never focusable: an extra for devices that
        drag. The keyboard path is the Trigger inside it.
      </>
    ),
    props: fileUploadDropZoneRows,
    attributes: fileUploadDropZoneAttributes,
  },
  {
    name: 'FileUpload.DropHint',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the class <code>kv-file-upload-drop-hint</code>: “or drop files
        here”, shown while the zone is drawn and the list isn’t full. It is in no description.
      </>
    ),
    props: fileUploadDropHintRows,
  },
  {
    name: 'FileUpload.Limits',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the class <code>kv-file-upload-limits</code>, built from{' '}
        <code>maxFiles</code>, <code>accept</code> and <code>maxFileSize</code>, so it can’t
        disagree with them. It renders nothing when no limit is set, and it is a description of the
        Field.
      </>
    ),
    props: fileUploadLimitsRows,
  },
  {
    name: 'FileUpload.Rejections',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the class <code>kv-file-upload-rejections</code>, a heading
        line and a <code>&lt;ul&gt;</code> with one line per file the latest add refused. It renders
        nothing without refusals, is not a live region, and the Trigger’s description lists it while
        it shows. The next add, a removal or <code>reset()</code> clears it.
      </>
    ),
    props: fileUploadRejectionsRows,
  },
  {
    name: 'FileUpload.Summary',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the class <code>kv-file-upload-summary</code>: “2 of 5 files
        added”, and at the limit what to do next. It renders nothing in single-file mode or with an
        empty list. The Trigger is described by it when the list is full.
      </>
    ),
    props: fileUploadSummaryRows,
  },
  {
    name: 'FileUpload.List',
    renders: (
      <>
        <code>&lt;ul role=&quot;list&quot;&gt;</code> named by the Field label, with the class{' '}
        <code>kv-file-upload-list</code>. It renders only when there is a file.
      </>
    ),
    props: fileUploadListRows,
  },
  {
    name: 'FileUpload.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the class <code>kv-file-upload-item</code>: one file. When the
        button that had focus goes away, focus moves to this item, then to the next one.
      </>
    ),
    props: fileUploadItemRows,
    attributes: fileUploadItemAttributes,
  },
  {
    name: 'FileUpload.Preview',
    renders: (
      <>
        <code>&lt;img alt=&quot;&quot;&gt;</code> for an image the browser can decode, otherwise a{' '}
        <code>&lt;span&gt;</code> with the document icon. Both are decorative, because the name is
        next to them. The class is <code>kv-file-upload-preview</code>, and the image’s object URL
        is revoked when the item goes away.
      </>
    ),
    props: fileUploadPreviewRows,
  },
  {
    name: 'FileUpload.Name, .Type and .Size',
    renders: (
      <>
        <code>&lt;bdi&gt;</code>, <code>&lt;span&gt;</code> and <code>&lt;span&gt;</code> with the
        classes <code>kv-file-upload-name</code>, <code>kv-file-upload-type</code> and{' '}
        <code>kv-file-upload-size</code>: the file name (with “(2)” when two files share one), the
        extension in capitals, and the size in the locale’s decimal units. Each takes{' '}
        <code>render</code>.
      </>
    ),
    props: fileUploadFileDetailRows,
  },
  {
    name: 'FileUpload.Status',
    renders: (
      <>
        <code>&lt;p&gt;</code>: the state in words, never colour alone. The item’s buttons are
        described by it.
      </>
    ),
    props: fileUploadStatusRows,
    attributes: fileUploadStatusAttributes,
  },
  {
    name: 'FileUpload.ItemError',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the class <code>kv-file-upload-item-error</code>, the error icon
        and the hidden prefix. It renders only while the item is failed, and the item’s buttons are
        described by it.
      </>
    ),
    props: fileUploadItemErrorRows,
  },
  {
    name: 'FileUpload.Progress',
    renders: (
      <>
        <code>&lt;progress&gt;</code> named “Uploading report.pdf”, with the class{' '}
        <code>kv-file-upload-progress</code>. It renders only while the file uploads, in whole
        percent, and without a value when the size is unknown. It is never announced.
      </>
    ),
    props: fileUploadProgressRows,
  },
  {
    name: 'FileUpload.Actions',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the class <code>kv-file-upload-actions</code>: a layout
        wrapper for an item’s buttons.
      </>
    ),
    props: fileUploadActionsRows,
  },
  {
    name: 'FileUpload.CancelButton, .RetryButton and .RemoveButton',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, one action per state: Cancel while the
        file uploads, Retry after a failure (unless the upload said it can’t be retried) or a
        cancel, otherwise Remove. A button that doesn’t apply, or any button in a disabled Field,
        isn’t rendered. When the focused button goes away, focus never falls to the page or to
        another button.
      </>
    ),
    props: fileUploadItemButtonRows,
    attributes: fileUploadItemButtonAttributes,
  },
]

export function FileUploadPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: FileUploadExampleSources
}) {
  return (
    <ComponentPage
      title="FileUpload"
      lead="Attach files to a form. One native button opens the system file dialog, a drop zone is an extra for devices that drag, and every file is checked against your limits before it enters the list."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it when someone must attach documents, receipts or photos to an application or a
            report.
          </li>
          <li>
            Say what to attach in the label and the description, and say the limits with{' '}
            <code>FileUpload.Limits</code>. Users can’t meet a limit they haven’t been told.
          </li>
          <li>
            Decide whether refused files block the form. The component shows why a file was refused,
            but it never marks the Field invalid. That is your decision.
          </li>
          <li>
            Not for choosing a value or a short answer: use a{' '}
            <Link href="/components/listbox">Listbox</Link> or a{' '}
            <Link href="/components/text-input">TextInput</Link>.
          </li>
          <li>
            Not as a security check. The checks run on the device, so your server must check type,
            size and content again.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultFileUpload />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="send-with-form"
            title="Send the files with a plain form"
            why={
              <>
                Without <code>upload</code>, files stay pending and the component keeps the native
                input’s files equal to the list, dropped files included. Give the input a{' '}
                <code>name</code>, and a normal form submit sends them.
              </>
            }
            code={sources['send-with-form']}
            propsUsed={[
              { part: 'FileUpload.Input', prop: 'name' },
              { part: 'FileUpload.Root', prop: 'accept' },
              { part: 'FileUpload.Root', prop: 'maxFiles' },
            ]}
          >
            <SendWithForm />
          </UseCase>
          <UseCase
            id="upload-yourself"
            title="Upload to your own server"
            why="KvirnUI sends nothing: you write upload. Report progress as a fraction from 0 to 1 and honour the signal, and the item shows a progress bar, a Cancel button while it uploads, and Retry or Remove afterwards."
            code={sources['upload-yourself']}
            propsUsed={[
              { part: 'FileUpload.Root', prop: 'upload' },
              { part: 'FileUpload.Root', prop: 'maxFiles' },
            ]}
            note={
              <Note kind="tip">
                What <code>upload</code> resolves with is stored on the item as <code>result</code>,
                so you can read server ids in <code>onFilesChange</code>. Progress is never
                announced, only starts, finishes and failures.
              </Note>
            }
          >
            <UploadYourself />
          </UseCase>
          <UseCase
            id="failure-reason"
            title="Say why an upload failed"
            why={
              <>
                A bare error is never shown to people: the item says the upload failed, in neutral
                words, and offers Retry. To say more, reject with an error that sets{' '}
                <code>retryable</code> and a <code>message</code> that names the file and says what
                to do. <code>retryable: false</code> leaves only Remove, and{' '}
                <code>FileUpload.ItemError</code> shows the message next to the status.
              </>
            }
            code={sources['failure-reason']}
            propsUsed={[{ part: 'FileUpload.Root', prop: 'upload' }]}
          >
            <FailureReason />
          </UseCase>
          <UseCase
            id="own-checks"
            title="Add a check of your own"
            why="The built-in checks cover type, size, count, empty files, duplicates and folders. For anything else, return a message from validate and the file is refused with that text. It runs after the built-in checks."
            code={sources['own-checks']}
            propsUsed={[
              { part: 'FileUpload.Root', prop: 'validate' },
              { part: 'FileUpload.Root', prop: 'accept' },
            ]}
            note={
              <Note kind="reminder">
                A client check is not security. Check the type, size and content again on your
                server, as in <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <OwnChecks />
          </UseCase>
          <UseCase
            id="single-file"
            title="One file, with a preview"
            why={
              <>
                With <code>multiple</code> off, a new file replaces the current one and the Trigger
                says “Replace file”. <code>FileUpload.Preview</code> shows a small thumbnail of an
                image, or the document icon for another file. It is decorative, so the name next to
                it stays the file’s name.
              </>
            }
            code={sources['single-file']}
            propsUsed={[
              { part: 'FileUpload.Root', prop: 'multiple' },
              { part: 'FileUpload.Root', prop: 'accept' },
              { part: 'FileUpload.Root', prop: 'maxFileSize' },
            ]}
          >
            <SingleFile />
          </UseCase>
          <UseCase
            id="missing-file"
            title="Say what is wrong when no file is attached"
            why={
              <>
                A file field is required when your form says so. Mark the Field{' '}
                <code>required</code> and <code>invalid</code> and render a{' '}
                <code>Field.ErrorMessage</code> that says what to do. The Trigger never has{' '}
                <code>aria-required</code>, because a button doesn’t allow it, so the label or the
                description must say that a file is needed. Read the files from{' '}
                <code>onFilesChange</code>.
              </>
            }
            code={sources['missing-file']}
            propsUsed={[{ part: 'FileUpload.Root', prop: 'onFilesChange' }]}
          >
            <MissingFile />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView contract={contract} extraAnnouncementRows={announcementRows} />
      }
      contractSections={contractSectionList(contract, announcementRows)}
      api={
        <ApiBlock
          importLine="import { Field, FileUpload, useFileUpload } from '@kvirn-ui/react'"
          parts={parts}
          hook={useFileUploadHook}
          strings={
            <StringsBlock
              namespace="fileUpload"
              component="FileUpload"
              layout="table"
              keys={fileUploadStringKeys}
            >
              <p>
                A visible text and the name of its button change together: override{' '}
                <code>remove</code> and <code>removeFile</code> as a pair, or the name no longer
                starts with its visible text. The label and the description are yours, because they
                say what to attach and why.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
