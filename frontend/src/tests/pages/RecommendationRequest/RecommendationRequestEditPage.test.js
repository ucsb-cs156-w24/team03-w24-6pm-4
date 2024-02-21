import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useParams: () => ({
            id: 1
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("RecommendationRequestEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecommendationRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Recommendation Request");
            expect(screen.queryByTestId("RecommendationRequestForm-requesterEmail")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).reply(200, {
                id: 1,
                requesterEmail: "johnsmith@ucsb.edu",
                professorEmail: "brianbaker@ucsb.edu",
                explanation: "BS/MS Program UCSB",
                dateRequested: "2020-02-14T12:34",
                dateNeeded: "2020-03-14T11:59",
                done: true
            });
            axiosMock.onPut('/api/recommendationrequests').reply(200, {
                id: 1,
                requesterEmail: "jeangenshin@ucsb.edu",
                professorEmail: "bronyahonkai@ucsb.edu",
                explanation: "PhD CS Stanford",
                dateRequested: "2021-01-23T17:22",
                dateNeeded: "2021-03-01T12:00",
                done: false 
            });
        });

        const queryClient = new QueryClient();
    
        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecommendationRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("RecommendationRequestForm-id");

            const requesterEmailInput = screen.getByLabelText("Requester Email");
            expect(requesterEmailInput).toBeInTheDocument();
            expect(requesterEmailInput).toHaveValue("johnsmith@ucsb.edu");
    
            const professorEmailInput = screen.getByLabelText("Professor Email");
            expect(professorEmailInput).toBeInTheDocument();
            expect(professorEmailInput).toHaveValue("brianbaker@ucsb.edu");
    
            const explanationInput = screen.getByLabelText("Explanation");
            expect(explanationInput).toBeInTheDocument();
            expect(explanationInput).toHaveValue("BS/MS Program UCSB");
    
            const dateRequestedInput = screen.getByLabelText("Date Requested (iso format)");
            expect(dateRequestedInput).toBeInTheDocument();
            expect(dateRequestedInput).toHaveValue("2020-02-14T12:34");
    
            const dateNeededInput = screen.getByLabelText("Date Needed (iso format)");
            expect(dateNeededInput).toBeInTheDocument();
            expect(dateNeededInput).toHaveValue("2020-03-14T11:59");
    
            const doneInput = screen.getByLabelText("Done");
            expect(doneInput).toBeInTheDocument();
            expect(doneInput).toBeChecked(true);
            const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

            expect(submitButton).toHaveTextContent("Update");

            fireEvent.change(requesterEmailInput, { target: { value: "jeangenshin@ucsb.edu" } })
            fireEvent.change(professorEmailInput, { target: { value: "bronyahonkai@ucsb.edu" } })
            fireEvent.change(explanationInput, { target: { value: "PhD CS Stanford" } })
            fireEvent.change(dateRequestedInput, { target: { value: "2021-01-23T17:22" } })
            fireEvent.change(dateNeededInput, { target: { value: "2021-03-01T12:00" } })
            fireEvent.click(doneInput, { target: { checked: true } })
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith(`Recommendation Request Updated - requesterEmail: jeangenshin@ucsb.edu professorEmail: bronyahonkai@ucsb.edu explanation: PhD CS Stanford dateRequested: 2021-01-23T17:22 dateNeeded: 2021-03-01T12:00 done: false`);
            
            expect(mockNavigate).toBeCalledWith({ "to": "/recommendationrequests" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                requesterEmail: "jeangenshin@ucsb.edu",
                professorEmail: "bronyahonkai@ucsb.edu",
                explanation: "PhD CS Stanford",
                dateRequested: "2021-01-23T17:22",
                dateNeeded: "2021-03-01T12:00",
                done: false 
            })); // posted object


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <RecommendationRequestEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("RecommendationRequestForm-id");

            const requesterEmailInput = screen.getByLabelText("Requester Email");
            expect(requesterEmailInput).toHaveValue("johnsmith@ucsb.edu");
    
            const professorEmailInput = screen.getByLabelText("Professor Email");
            expect(professorEmailInput).toHaveValue("brianbaker@ucsb.edu");
    
            const explanationInput = screen.getByLabelText("Explanation");
            expect(explanationInput).toHaveValue("BS/MS Program UCSB");
    
            const dateRequestedInput = screen.getByLabelText("Date Requested (iso format)");
            expect(dateRequestedInput).toHaveValue("2020-02-14T12:34");
    
            const dateNeededInput = screen.getByLabelText("Date Needed (iso format)");
            expect(dateNeededInput).toHaveValue("2020-03-14T11:59");
    
            const doneInput = screen.getByLabelText("Done");
            expect(doneInput).toBeChecked(true);
            const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

            // expect(idField).toHaveValue("17");
            // expect(nameField).toHaveValue("Freebirds");
            // expect(descriptionField).toHaveValue("Brritos");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(requesterEmailInput, { target: { value: "jeangenshin@ucsb.edu" } })
            fireEvent.change(professorEmailInput, { target: { value: "bronyahonkai@ucsb.edu" } })
            fireEvent.change(explanationInput, { target: { value: "PhD CS Stanford" } })
            fireEvent.change(dateRequestedInput, { target: { value: "2021-01-23T17:22" } })
            fireEvent.change(dateNeededInput, { target: { value: "2021-03-01T12:00" } })
            fireEvent.click(doneInput, { target: { checked: true } })

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith(`Recommendation Request Updated - requesterEmail: jeangenshin@ucsb.edu professorEmail: bronyahonkai@ucsb.edu explanation: PhD CS Stanford dateRequested: 2021-01-23T17:22 dateNeeded: 2021-03-01T12:00 done: false`);
            
            expect(mockNavigate).toBeCalledWith({ "to": "/recommendationrequests" });
        });

       
    });
});
