package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.controllers.RecommendationRequestController;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTests extends ControllerTestCase {

        @MockBean
        RecommendationRequestRepository recommendationRequestRepository;

        @MockBean
        UserRepository userRepository;

        // Tests for GET /api/recommendationrequests/all
        
        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/recommendationrequests/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/recommendationrequests/all"))
                                .andExpect(status().is(200)); // logged
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_recommendationrequests() throws Exception {

                // arrange
                LocalDateTime dr1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime dn1 = LocalDateTime.parse("2022-01-03T00:00:00");
                boolean done1 = true;

                RecommendationRequest request1 = RecommendationRequest.builder()
                                .requesterEmail("requester1@ucsb.edu")
                                .professorEmail("professor1@ucsb.edu")
                                .explanation("explain1")
                                .dateRequested(dr1)
                                .dateNeeded(dn1)
                                .done(done1)
                                .build();

                LocalDateTime dr2 = LocalDateTime.parse("2022-03-11T00:00:00");
                LocalDateTime dn2 = LocalDateTime.parse("2022-03-11T00:00:00");
                boolean done2 = false;

                RecommendationRequest request2 = RecommendationRequest.builder()
                                .requesterEmail("requester2@ucsb.edu")
                                .professorEmail("professor2@ucsb.edu")
                                .explanation("explain2")
                                .dateRequested(dr2)
                                .dateNeeded(dn2)
                                .done(done2)
                                .build();

                ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
                expectedRequests.addAll(Arrays.asList(request1, request2));

                when(recommendationRequestRepository.findAll()).thenReturn(expectedRequests);

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequests/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedRequests);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        // Tests for POST /api/recommendationrequests/post...

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/recommendationrequests/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/recommendationrequests/post"))
                                .andExpect(status().is(403)); // only admins can post
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_recommendationrequest() throws Exception {
                // arrange

                LocalDateTime dr1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime dn1 = LocalDateTime.parse("2022-01-03T00:00:00");
                boolean done1 = true;

                RecommendationRequest request1 = RecommendationRequest.builder()
                                .requesterEmail("requester1@ucsb.edu")
                                .professorEmail("professor1@ucsb.edu")
                                .explanation("explain1")
                                .dateRequested(dr1)
                                .dateNeeded(dn1)
                                .done(done1)
                                .build();

                when(recommendationRequestRepository.save(eq(request1))).thenReturn(request1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/recommendationrequests/post?requesterEmail=requester1@ucsb.edu&professorEmail=professor1@ucsb.edu&explanation=explain1&dateRequested=2022-01-03T00:00:00&dateNeeded=2022-01-03T00:00:00&done=true")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(recommendationRequestRepository, times(1)).save(request1);
                String expectedJson = mapper.writeValueAsString(request1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        // Tests for GET /api/recommendationrequests?id=...

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/recommendationrequests?id=123"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

                // arrange
                LocalDateTime dr1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime dn1 = LocalDateTime.parse("2022-01-03T00:00:00");
                boolean done1 = true;

                RecommendationRequest request1 = RecommendationRequest.builder()
                                .requesterEmail("requester1@ucsb.edu")
                                .professorEmail("professor1@ucsb.edu")
                                .explanation("explain1")
                                .dateRequested(dr1)
                                .dateNeeded(dn1)
                                .done(done1)
                                .build();

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.of(request1));

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequests?id=123"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(123L));
                String expectedJson = mapper.writeValueAsString(request1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/recommendationrequests?id=123"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(recommendationRequestRepository, times(1)).findById(eq(123L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("RecommendationRequest with id 123 not found", json.get("message"));
        }


        // Tests for DELETE /api/recommendationrequests?id=... 

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_a_request() throws Exception {
                // arrange

                LocalDateTime dr1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime dn1 = LocalDateTime.parse("2022-01-03T00:00:00");
                boolean done1 = true;

                RecommendationRequest request1 = RecommendationRequest.builder()
                                .requesterEmail("requester1@ucsb.edu")
                                .professorEmail("professor1@ucsb.edu")
                                .explanation("explain1")
                                .dateRequested(dr1)
                                .dateNeeded(dn1)
                                .done(done1)
                                .build();

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.of(request1));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/recommendationrequests?id=123")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(recommendationRequestRepository, times(1)).findById(123L);
                verify(recommendationRequestRepository, times(1)).delete(any());

                Map<String, Object> json = responseToJson(response);
                assertEquals("RecommendationRequest with id 123 deleted", json.get("message"));
        }
        
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_request_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/recommendationrequests?id=123")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(recommendationRequestRepository, times(1)).findById(123L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("RecommendationRequest with id 123 not found", json.get("message"));
        }

        // Tests for PUT /api/recommendationrequests?id=... 

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_request() throws Exception {
                // arrange

                LocalDateTime dr1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime dn1 = LocalDateTime.parse("2022-01-03T00:00:00");
                boolean done1 = true;

                RecommendationRequest reqOrig = RecommendationRequest.builder()
                                .requesterEmail("requester1@ucsb.edu")
                                .professorEmail("professor1@ucsb.edu")
                                .explanation("explain1")
                                .dateRequested(dr1)
                                .dateNeeded(dn1)
                                .done(done1)
                                .build();

                LocalDateTime dr2 = LocalDateTime.parse("2012-03-11T00:10:00");
                LocalDateTime dn2 = LocalDateTime.parse("2022-03-11T00:00:20");
                boolean done2 = false;

                RecommendationRequest reqEdit = RecommendationRequest.builder()
                                .requesterEmail("requester2@ucsb.edu")
                                .professorEmail("professor2@ucsb.edu")
                                .explanation("explain2")
                                .dateRequested(dr2)
                                .dateNeeded(dn2)
                                .done(done2)
                                .build();

                String requestBody = mapper.writeValueAsString(reqEdit);

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.of(reqOrig));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/recommendationrequests?id=123")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(recommendationRequestRepository, times(1)).findById(123L);
                verify(recommendationRequestRepository, times(1)).save(reqEdit); // should be saved with correct user
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_request_that_does_not_exist() throws Exception {
                // arrange

                LocalDateTime dr2 = LocalDateTime.parse("2012-03-11T00:10:00");
                LocalDateTime dn2 = LocalDateTime.parse("2022-03-11T00:00:20");
                boolean done2 = false;

                RecommendationRequest reqEdit = RecommendationRequest.builder()
                                .requesterEmail("requester2@ucsb.edu")
                                .professorEmail("professor2@ucsb.edu")
                                .explanation("explain2")
                                .dateRequested(dr2)
                                .dateNeeded(dn2)
                                .done(done2)
                                .build();

                String requestBody = mapper.writeValueAsString(reqEdit);

                when(recommendationRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/recommendationrequests?id=123")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(recommendationRequestRepository, times(1)).findById(123L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("RecommendationRequest with id 123 not found", json.get("message"));

        }
}