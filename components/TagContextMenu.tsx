import { Pressable } from 'react-native'
import * as ContextMenu from 'zeego/context-menu'

const TagContextMenu = () => {
    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <Pressable>
                    
                </Pressable>
            </ContextMenu.Trigger>
            {/* <ContextMenu.Content>
                <ContextMenu.Preview>{() => <Preview />}</ContextMenu.Preview>
                <ContextMenu.Label />
                <ContextMenu.Item>
                    <ContextMenu.ItemTitle />
                </ContextMenu.Item>
                <ContextMenu.Group>
                    <ContextMenu.Item />
                </ContextMenu.Group>
                <ContextMenu.CheckboxItem>
                    <ContextMenu.ItemIndicator />
                </ContextMenu.CheckboxItem>
                <ContextMenu.Sub>
                    <ContextMenu.SubTrigger />
                    <ContextMenu.SubContent />
                </ContextMenu.Sub>
                <ContextMenu.Separator />
                <ContextMenu.Arrow />
            </ContextMenu.Content> */}
        </ContextMenu.Root>
    )
}

export default TagContextMenu