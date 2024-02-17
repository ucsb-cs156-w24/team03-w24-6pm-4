import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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
            id: 5
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("MenuItemReviewEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <MenuItemReviewEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Review");
            expect(screen.queryByTestId("MenuItemReview-name")).not.toBeInTheDocument();
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
            axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).reply(200, {
                id: 5,
                diningCommonsCode: "ortega",
                name: "Caesar Salad",
                salad: "Salads"
            });
            axiosMock.onPut('/api/menuitemreview').reply(200, {
                id: "5",
                diningCommonsCode: "ortega-2",
                name: "Super Caesar Salad!",
                description: "Super Salads"
            });
        });

        const queryClient = new QueryClient();
    
        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <MenuItemReviewEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("MenuItemReviewForm-id");

            const idField = screen.getByTestId("MenuItemReviewForm-id");
            const diningCommonsCodeField = screen.getByTestId("MenuItemReviewForm-diningCommonsCode");
            const nameField = screen.getByTestId("MenuItemReviewForm-name");
            const stationField = screen.getByTestId("MenuItemReviewForm-station");
            const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

            expect(idField).toBeInTheDocument();
            expect(idField).toHaveValue("17");
            expect(diningCommonsCodeField).toBeInTheDocument();
            expect(diningCommonsCodeField).toHaveValue("ortega");
            expect(nameField).toBeInTheDocument();
            expect(nameField).toHaveValue("Caesar Salad");
            expect(stationField).toBeInTheDocument();
            expect(stationField).toHaveValue("Salads");

            expect(submitButton).toHaveTextContent("Update");

            fireEvent.change(diningCommonsCodeField, { target: { value: 'ortega-2' } });
            fireEvent.change(nameField, { target: { value: 'Super Caesar Salad!' } });
            fireEvent.change(stationField, { target: { value: 'Super Salads' } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Review Updated - id: 5 name: Super Caesar Salad!");
            
            expect(mockNavigate).toBeCalledWith({ "to": "/menuitemreview" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                diningCommonsCode: "ortega-2",
                name: "Super Caesar Salad!",
                description: "Super Salads"
            })); // posted object


        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <MenuItemReviewEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("MenuItemReviewForm-id");

            const idField = screen.getByTestId("MenuItemReviewForm-id");
            const diningCommonsCodeField = screen.getByTestId("MenuItemReviewForm-diningCommonsCode");
            const nameField = screen.getByTestId("MenuItemReviewForm-name");
            const stationField = screen.getByTestId("MenuItemReviewForm-station");
            const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

            expect(idField).toHaveValue("5");
            expect(diningCommonsCodeField).toHaveValue("ortega");
            expect(nameField).toHaveValue("Caesar Salad");
            expect(stationField).toHaveValue("Salads");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(nameField, { target: { value: 'Freebirds World Burrito' } })
            fireEvent.change(descriptionField, { target: { value: 'Big Burritos' } })

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Review Updated - id: 17 name: Freebirds World Burrito");
            expect(mockNavigate).toBeCalledWith({ "to": "/menuitemreview" });
        });

       
    });
});
