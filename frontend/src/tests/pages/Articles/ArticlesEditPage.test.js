import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
            id: 17
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("ArticlesEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {
            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Article");
            expect(screen.queryByTestId("ArticlesForm-explanation")).not.toBeInTheDocument();
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
            axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
                id: 17,
                title: "Article1",
                url: "https://www.Article1.com",
                explanation: "First Article",
                email: "Article1@gmail.com",
                dateAdded: "2022-03-14T15:00"
            });
            axiosMock.onPut('/api/articles').reply(200, {
                id: "17",
                title: "Article2",
                url: "https://www.Article2.com",
                explanation: "Second Article",
                email: "Article2@gmail.com",
                dateAdded: "2022-12-25T08:00"
            });
        });

        const queryClient = new QueryClient();
        test("renders without crashing", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
        });

        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("ArticlesForm-explanation");

            const idField = screen.getByTestId("ArticlesForm-id");
            const emailField = screen.getByTestId("ArticlesForm-email");
            const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
            const titleField = screen.getByTestId("ArticlesForm-title");
            const urlField = screen.getByTestId("ArticlesForm-url");
            const explanationField = screen.getByTestId("ArticlesForm-explanation");
            const submitButton = screen.getByTestId("ArticlesForm-submit");

            expect(idField).toHaveValue("17");
            expect(emailField).toHaveValue("Article1@gmail.com");
            expect(dateAddedField).toHaveValue("2022-03-14T15:00");
            expect(titleField).toHaveValue("Article1");
            expect(urlField).toHaveValue("https://www.Article1.com");
            expect(explanationField).toHaveValue("First Article");
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toHaveTextContent("Update");
        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("ArticlesForm-explanation");

            const idField = screen.getByTestId("ArticlesForm-id");
            const emailField = screen.getByTestId("ArticlesForm-email");
            const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
            const titleField = screen.getByTestId("ArticlesForm-title");
            const urlField = screen.getByTestId("ArticlesForm-url");
            const explanationField = screen.getByTestId("ArticlesForm-explanation");
            const submitButton = screen.getByTestId("ArticlesForm-submit");

            expect(idField).toHaveValue("17");
            expect(emailField).toHaveValue("Article1@gmail.com");
            expect(dateAddedField).toHaveValue("2022-03-14T15:00");
            expect(titleField).toHaveValue("Article1");
            expect(urlField).toHaveValue("https://www.Article1.com");
            expect(explanationField).toHaveValue("First Article");
            expect(submitButton).toBeInTheDocument();

            fireEvent.change(emailField, { target: { value: "Article2@gmail.com" } });
            fireEvent.change(dateAddedField, { target: { value: "2022-12-25T08:00" } });
            fireEvent.change(titleField, { target: { value: "Article2" } });
            fireEvent.change(urlField, { target: { value: "https://www.Article2.com" } });
            fireEvent.change(explanationField, { target: { value: "Second Article" } });
            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Articles Updated - id: 17 title: Article2");
            expect(mockNavigate).toBeCalledWith({ "to": "/articles" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                title: "Article2",
                url: "https://www.Article2.com",
                explanation: "Second Article",
                email: "Article2@gmail.com",
                dateAdded: "2022-12-25T08:00"
            })); 

        });

    
    });
});