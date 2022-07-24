import Node from './node.js'

export default {
    props: ['structure'],
    emits: ['updateStructure'],
    components: {
        Node
    },
    methods:{
        updateStructure(change){
            let instructions = change.split("|");
            let count = 0;

            let previous = null;
            let structure = JSON.parse(JSON.stringify(this.structure));
            let current = structure;
            while(!_.isEmpty(instructions) && count < 1000){
                let instruction = instructions.shift();
                let nodeId = (+instruction);
                if(instruction == 'Root'){
                    // Nothing to do here
                } else if(_.isNumber(nodeId) && !_.isNaN(nodeId)){
                    let next = _.findWhere(current.children, {nodeId: nodeId});
                    previous = current;
                    current = next;
                } else if(instruction.startsWith('addChild')){
                    if(!_.has(current, 'children')){
                        current.children = [];
                    }
                    current.children.push({nodeId:current.count++, count: 0});
                } else if(instruction.startsWith('removeChild')){
                    previous.children.splice(_.findIndex(previous.children, (c) => {return c.nodeId == current.nodeId}), 1);
                } else if(instruction.startsWith('nodeType')){
                    current.nodeType = instruction.substring('nodeType='.length);
                } else if(instruction.startsWith('quantity')){
                    current.quantity = instruction.substring('quantity='.length);
                } else if(instruction.startsWith('resource')){
                    current.resource = instruction.substring('resource='.length);
                }
            }
            this.$emit('updateStructure', structure);
        }
    },
    template:
    `
        <Node v-if="structure != null" :nodeId="structure.nodeId" @changeStructure="updateStructure($event)" :nodeType="structure.nodeType"
               :quantity="structure.quantity" :resource="structure.resource"
               :children="structure.children" :count="structure.count" showExcludeButton="false"/>
    `
}