// UserDetailsPage.test.tsx
import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Import the page component and the function to be mocked
import UserDetailsPage from './page';
import * as userQuery from '@/actions/user/query';
import * as nextNavigation from 'next/navigation';

// Mock next/navigation to control notFound behavior
vi.mock('next/navigation', () => ({
    notFound: vi.fn(() => {
        throw new Error('Not Found');
    }),
}));

describe('UserDetailsPage', () => {
    const dummyUser = {
        id: '123',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        image: '/test-image.png',
        isActive: true,
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    it('renders user details correctly when user is found', async () => {
        // Mock getUserById to return a dummy user
        vi.spyOn(userQuery, 'getUserById').mockResolvedValue(dummyUser as any);

        // Simulate the params prop expected by the page
        const params = Promise.resolve({id: '123'});
        // Await the async component to get the returned JSX
        const PageComponent = await UserDetailsPage({params});

        // Render the returned JSX
        render(PageComponent);

        // Verify key elements are in the document
        expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
        expect(screen.getByText(dummyUser.username)).toBeInTheDocument();
        expect(screen.getByText(dummyUser.name)).toBeInTheDocument();
        expect(screen.getByText(dummyUser.email)).toBeInTheDocument();

        // Instead of getByText, use getByRole to uniquely target the badge element.
        expect(screen.getByRole('option', {name: /Active/i})).toBeInTheDocument();

        // Check that the back button is rendered
        expect(screen.getByRole('button', {name: /Back to Users/i})).toBeInTheDocument();
    });

    it('calls notFound when user is not found', async () => {
        // Mock getUserById to return null (user not found)
        vi.spyOn(userQuery, 'getUserById').mockResolvedValue(null);

        const params = Promise.resolve({id: '123'});

        // Expect the async component to throw an error when notFound is called.
        await expect(UserDetailsPage({params})).rejects.toThrow('Not Found');

        // Optionally, verify that our notFound mock was called.
        expect(nextNavigation.notFound).toHaveBeenCalled();
    });
});
