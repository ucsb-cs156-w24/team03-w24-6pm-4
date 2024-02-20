import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("RecommendationRequestForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["Requester Email", "Professor Email", "Explanation", "Date Requested (iso format)", "Date Needed (iso format)", "Done"];
    const testId = "RecommendationRequestForm";

    test("renders correctly", async () => {

        render(
            <Router  >
                <RecommendationRequestForm />
            </Router>
        );
        await screen.findByText(/Professor Email/);
        await screen.findByText(/Done/);
        await screen.findByText(/Create/);
    });


    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecommendationRequestForm />
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
                    <RecommendationRequestForm initialContents={recommendationRequestFixtures.oneRecommendationRequest} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        expect(await screen.findByTestId(/RecommendationRequestForm-submit/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
        expect(screen.getByText(`Id`)).toBeInTheDocument();
    });

    test("renders correctly when passing in a recommendation request", async () => {

        render(
            <Router  >
                <RecommendationRequestForm initialContents={recommendationRequestFixtures.oneRecommendationRequest[0]} />
            </Router>
        );
        await screen.findByTestId(/RecommendationRequestForm-requesterEmail/);
        expect(screen.getByTestId(/RecommendationRequestForm-requesterEmail/)).toHaveValue("johnsmith@ucsb.edu");

        await screen.findByTestId(/RecommendationRequestForm-professorEmail/);
        expect(screen.getByTestId(/RecommendationRequestForm-professorEmail/)).toHaveValue("brianbaker@ucsb.edu");

        await screen.findByTestId(/RecommendationRequestForm-explanation/);
        expect(screen.getByTestId(/RecommendationRequestForm-explanation/)).toHaveValue("BS/MS Program UCSB");

        await screen.findByTestId(/dateRequested/);
        expect(screen.getByTestId(/dateRequested/)).toHaveValue("2020-02-14T12:34:05.000");

        await screen.findByTestId(/dateNeeded/);
        expect(screen.getByTestId(/dateNeeded/)).toHaveValue("2020-03-14T11:59:59.000");

        await screen.findByTestId(/RecommendationRequestForm-done/);
        expect(screen.getByTestId(/RecommendationRequestForm-done/)).toBeChecked();

        expect(screen.queryByText(/Requester Email must be a valid email./)).not.toBeInTheDocument();
        expect(screen.queryByText(/Professor Email must be a valid email./)).not.toBeInTheDocument();
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <RecommendationRequestForm />
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
                    <RecommendationRequestForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByText(/Requester Email is required./);
        // expect(screen.getByText(/Requester Email is required./)).toBeInTheDocument();
        expect(screen.getByText(/Professor Email is required./)).toBeInTheDocument();
        expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
        expect(screen.getByText(/Date Requested is required./)).toBeInTheDocument();
        expect(screen.getByText(/Date Needed is required./)).toBeInTheDocument();
    });

    test("Correct Error messsages on bad input", async () => {

        render(
            <Router  >
                <RecommendationRequestForm />
            </Router>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        const requesterEmailInput = screen.getByLabelText("Requester Email");
        const professorEmailInput = screen.getByLabelText("Professor Email");
        const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

        fireEvent.change(requesterEmailInput, { target: { value: "&!@^!#&$^&" } })
        fireEvent.change(professorEmailInput, { target: { value: "992!&@&&!&*CHDBWB" } })
        fireEvent.click(submitButton);

        await screen.findByText(/Requester Email must be a valid email./);
        expect(screen.getByText(/Professor Email must be a valid email./)).toBeInTheDocument();
    });

});