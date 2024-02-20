import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBDiningCommonsMenuItemForm from 'main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm';
import { Navigate } from 'react-router-dom'
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RestaurantEditPage({storybook=false}) {
    let { id } = useParams();

    const { data: item, _error, _status } =
        useBackend(
            // Stryker disable next-line all : don't test internal caching of React Query
            [`/api/ucsbdiningcommonsmenuitem?id=${id}`],
            {  // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
                method: "GET",
                url: `/api/ucsbdiningcommonsmenuitem`,
                params: {
                    id
                }
            }
        );

    const objectToAxiosPutParams = (item) => ({
        url: "/api/ucsbdiningcommonsmenuitem",
        method: "PUT",
        params: {
            id: item.id,
        },
        data: {
            name: item.name,
            diningCommonsCode: item.diningCommonsCode,
            station: item.station
        }
    });

    const onSuccess = (item) => {
        toast(`UCSBDiningCommonsMenuItem Updated - id: ${item.id} name: ${item.name}`);
    }

    const mutation = useBackendMutation(
        objectToAxiosPutParams,
        { onSuccess },
        // Stryker disable next-line all : hard to set up test for caching
        [`/api/ucsbdiningcommonsmenuitem?id=${id}`]
    );

    const { isSuccess } = mutation

    const onSubmit = async (data) => {
        mutation.mutate(data);
    }

    if (isSuccess && !storybook) {
        return <Navigate to="/ucsbdiningcommonsmenuitem" />
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Edit Menu Item</h1>
                {
                    item && <UCSBDiningCommonsMenuItemForm submitAction={onSubmit} buttonLabel={"Update"} initialContents={item} />
                }
            </div>
        </BasicLayout>
    )

}