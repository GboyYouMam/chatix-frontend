import assert from 'node:assert/strict';
import { formatAttachmentSize, getAttachmentSelectionError } from '../src/components/rooms/attachments.ts';

assert.equal(getAttachmentSelectionError(Array.from({ length: 6 }, (_, i) => ({ name: `${i}`, size: 1 }))), 'Attach up to 5 files.');
assert.equal(getAttachmentSelectionError([{ name: 'huge.zip', size: 10 * 1024 * 1024 + 1 }]), 'huge.zip is larger than 10 MB.');
assert.equal(getAttachmentSelectionError([{ name: 'fine.png', size: 10 * 1024 * 1024 }]), null);
assert.equal(formatAttachmentSize(1025), '2 KB');
assert.equal(formatAttachmentSize(10 * 1024 * 1024), '10 MB');
