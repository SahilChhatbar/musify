import { Notification as MantineNotification, Alert } from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { NotificationProps } from "../../../types/index";

const Notification = ({ type, message }: NotificationProps) => {
  if (type === "error") {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {message}
      </Alert>
    );
  }

  return (
    <MantineNotification
      title={type === "success" ? "Success" : "Error"}
      icon={type === "success" ? <IconCheck size={18} /> : null}
      color={type === "success" ? "green" : "red"}
      onClose={(() => {})}
    >
      {message}
    </MantineNotification>
  );
};

export default Notification;