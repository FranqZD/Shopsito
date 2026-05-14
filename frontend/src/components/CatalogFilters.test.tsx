import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CatalogFilters from './CatalogFilters';
import apiService from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockCategories = [
  { id: 1, name: 'electronics' },
  { id: 2, name: 'clothing' },
  { id: 3, name: 'home' },
];

describe('CatalogFilters', () => {
  let onSearchChange: ReturnType<typeof vi.fn>;
  let onCategoryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onSearchChange = vi.fn();
    onCategoryChange = vi.fn();
    (apiService.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCategories });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches categories on mount and renders them in the dropdown', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    expect(apiService.get).toHaveBeenCalledWith('/api/categories');

    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4); // "All Categories" + 3 categories
    expect(options[1]).toHaveTextContent('Electronics');
    expect(options[2]).toHaveTextContent('Clothing');
    expect(options[3]).toHaveTextContent('Home');
  });

  it('debounces search input and only triggers after 300ms with min 2 chars', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const input = screen.getByPlaceholderText('Search products...');

    // Type 2 characters — should NOT trigger immediately
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(onSearchChange).not.toHaveBeenCalled();

    // After 300ms debounce, it should trigger
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearchChange).toHaveBeenCalledWith('ab');
  });

  it('notifies parent with empty string when search is cleared', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const input = screen.getByPlaceholderText('Search products...');

    // Type and wait for debounce
    fireEvent.change(input, { target: { value: 'test' } });
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearchChange).toHaveBeenCalledWith('test');

    // Clear the input
    fireEvent.change(input, { target: { value: '' } });
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onCategoryChange when a category is selected', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'electronics' } });
    expect(onCategoryChange).toHaveBeenCalledWith('electronics');
  });

  it('calls onCategoryChange with empty string when "All Categories" is selected', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const select = screen.getByRole('combobox');

    // Select a category first
    fireEvent.change(select, { target: { value: 'clothing' } });
    expect(onCategoryChange).toHaveBeenCalledWith('clothing');

    // Deselect
    fireEvent.change(select, { target: { value: '' } });
    expect(onCategoryChange).toHaveBeenCalledWith('');
  });

  it('does not trigger search callback for 1 character input', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const input = screen.getByPlaceholderText('Search products...');
    fireEvent.change(input, { target: { value: 'x' } });
    act(() => { vi.advanceTimersByTime(500); });
    // 1 char is between 0 and 2, so neither the "cleared" nor "search" branch fires
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('debounces rapid typing — only last value is sent', async () => {
    await act(async () => {
      render(<CatalogFilters onSearchChange={onSearchChange} onCategoryChange={onCategoryChange} />);
    });

    const input = screen.getByPlaceholderText('Search products...');

    // Rapid typing within debounce window
    fireEvent.change(input, { target: { value: 'he' } });
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.change(input, { target: { value: 'hel' } });
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.change(input, { target: { value: 'hell' } });

    // Wait for debounce to settle
    act(() => { vi.advanceTimersByTime(300); });

    // Only the final value should have been sent
    expect(onSearchChange).toHaveBeenCalledWith('hell');
    // Should not have been called with intermediate values
    expect(onSearchChange).not.toHaveBeenCalledWith('he');
    expect(onSearchChange).not.toHaveBeenCalledWith('hel');
  });
});
