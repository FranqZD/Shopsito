import { describe, it, expect, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from './toast';
import { toast as sonnerToast } from 'sonner';

describe('toast utility', () => {
  it('calls sonner success with the message', () => {
    toast.success('Product created!');
    expect(sonnerToast.success).toHaveBeenCalledWith('Product created!');
  });

  it('calls sonner error with the message', () => {
    toast.error('Something went wrong');
    expect(sonnerToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('calls sonner warning with the message', () => {
    toast.warning('Stock is low');
    expect(sonnerToast.warning).toHaveBeenCalledWith('Stock is low');
  });

  it('calls sonner info with the message', () => {
    toast.info('Session expired');
    expect(sonnerToast.info).toHaveBeenCalledWith('Session expired');
  });
});
