import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("MenuItemReviewForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["Item ID", "Reviewer Email", "Stars", "Date Reviewed", "Comments"];
    const testId = "MenuItemReviewForm";

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm initialContents={menuItemReviewFixtures.oneReview} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-itemId`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-reviewerEmail`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-stars`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-dateReviewed`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-comments`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-submit`)).toBeInTheDocument();
        expect(screen.getByText(`ID`)).toBeInTheDocument();
        expect(screen.getByText(`Item ID`)).toBeInTheDocument();
        expect(screen.getByText(`Reviewer Email`)).toBeInTheDocument();
        expect(screen.getByText(`Stars`)).toBeInTheDocument();
        expect(screen.getByText(`Date Reviewed`)).toBeInTheDocument();
        expect(screen.getByText(`Comments`)).toBeInTheDocument();
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("that the correct validations are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <MenuItemReviewForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByText(/Item ID is required./);
        expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
        expect(screen.getByText(/Star rating is required./)).toBeInTheDocument();
        expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
        expect(screen.getByText(/Comment is required./)).toBeInTheDocument();

        const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
        fireEvent.change(reviewerEmailInput, { target: { value: "a".repeat(31) } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
        });


        const starsInput = screen.getByTestId(`${testId}-stars`);
        fireEvent.change(starsInput, { target: { value: -1 } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/Minimum value is 0/)).toBeInTheDocument();
        });

        fireEvent.change(starsInput, { target: { value: 6 } });
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/Maximum value is 5/)).toBeInTheDocument();
        });


        const commentsInput = screen.getByTestId(`${testId}-comments`);
        fireEvent.change(commentsInput, { target: { value: "a".repeat(501) } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Max length 500 character/)).toBeInTheDocument();
        });

    });

});