import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemCard from '../ItemCard';

// Mock Next.js modules
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockItem = {
  id: '1',
  title: 'Test Item',
  imageUrl: '/test-image.jpg',
  pricePerDay: 10,
  condition: 'gut',
  location: 'Test Location',
  available: true,
  user: {
    id: '1',
    name: 'Test Owner',
  },
  category: 'werkzeuge',
};

describe('ItemCard', () => {
  it('renders item information correctly', () => {
    render(<ItemCard {...mockItem} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('10 €/Tag')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('gut')).toBeInTheDocument();
  });

  it('renders the item image with correct alt text', () => {
    render(<ItemCard {...mockItem} />);
    
    const image = screen.getByAltText('Test Item');
    expect(image).toBeInTheDocument();
  });

  it('creates correct link to item detail page', () => {
    render(<ItemCard {...mockItem} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/items/1');
  });

  it('shows unavailable state when item is not available', () => {
    const unavailableItem = { ...mockItem, available: false };
    render(<ItemCard {...unavailableItem} />);
    
    expect(screen.getByText('Nicht verfügbar')).toBeInTheDocument();
  });
});