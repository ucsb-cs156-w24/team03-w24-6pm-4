import React from 'react';
import RestaurantTable from 'main/components/UCSBOrganization/UCSBOrganizationTable';
import { UCSBOrganizationFixtures, restaurantFixtures } from 'fixtures/UCSBOrganizationFixtures';
import { currentUserFixtures } from 'fixtures/UCSBOrganizationFixtures';
import { rest } from "msw";
import UCSBOrganizationTable from 'main/components/UCSBOrganization/UCSBOrganizationTable';

export default {
    title: 'components/UCSBOrganization/UCSBOrganizationTable',
    component: UCSBOrganizationTable
};

const Template = (args) => {
    return (
        <RestaurantTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    restaurants: []
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
    organizations: UCSBOrganizationFixtures.threeOrganizations,
    currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
    organizations: UCSBOrganizationFixtures.threeOrganizations,
    currentUser: currentUserFixtures.adminUser,
}

ThreeItemsAdminUser.parameters = {
    msw: [
        rest.delete('/api/UCSBOrganization', (req, res, ctx) => {
            window.alert("DELETE: " + JSON.stringify(req.url));
            return res(ctx.status(200),ctx.json({}));
        }),
    ]
};
