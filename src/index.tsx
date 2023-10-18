import { ActionPanel, Detail, List, Icon, Action } from "@raycast/api";
import { https } from "follow-redirects";
import data from "linux-command";
import { useEffect, useState } from "react";

type CommandType = {
  n: string;
  p: string;
  d: string;
};

export default function Command() {
  return (
    <List>
      {Object.keys(data).map((name, key) => {
        const item: CommandType = (data as Record<string, CommandType>)[name];
        return <CommandPanel key={key} name={item.n} detail={item.d} path={item.p} />;
      })}
    </List>
  );
}

interface CommandPanelProps {
  name: string;
  detail: string;
  path: string;
}

const CommandPanel = (props: CommandPanelProps) => {
  return (
    <List.Item
      title={props.name}
      subtitle={props.detail}
      icon={Icon.Terminal}
      actions={
        <ActionPanel>
          <Action.Push
            title="Show Details"
            icon={Icon.Eye}
            shortcut={{ modifiers: ["cmd"], key: "." }}
            target={
              <DetailMarkdown command={props.path.replace(/^\//, "")} markdown={"![loading](../assets/loading.gif)"} />
            }
          />
        </ActionPanel>
      }
    />
  );
};

interface DetailMarkdownProps {
  markdown: string;
  command: string;
}
const DetailMarkdown = (props: DetailMarkdownProps) => {
  const [markdown, setMarkdown] = useState(props.markdown);
  useEffect(() => {
    https
      .get(`https://unpkg.com/linux-command/command/${props.command}.md`, (res) => {
        let data = "";
        res.on("data", (d) => {
          data = data + d.toString();
          process.stdout.write(d);
        });

        res.on("end", () => {
          setMarkdown(data);
        });
      })
      .on("error", (e) => {
        setMarkdown(`ERROR: ${e.message}`);
        console.error(e.message);
      });
  }, []);
  return <Detail markdown={markdown} isLoading={markdown == "![loading](../assets/loading.gif)"} />;
};
