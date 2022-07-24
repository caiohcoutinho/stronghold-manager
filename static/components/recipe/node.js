export default {
    name: 'Node',
    props: ['nodeId', 'nodeType', 'children', 'quantity', 'resource', 'count', 'showExcludeButton'],
    emits: ['changeStructure'],
    computed: {
        resources(){
            return this.$store.state.resources;
        },
        noChildren(){
            return _.isEmpty(this.children);
        },
        isInternNode(){
            return !_.isNull(this.nodeType) && !_.isUndefined(this.nodeType) && this.nodeType != 'resource';
        }
    },
    methods: {
        addChild(){
            this.$emit('changeStructure', this.nodeId+'|addChild');
        },
        removeNode(){
            this.$emit('changeStructure', this.nodeId+'|removeChild');
        },
        changeNodeType(newValue){
            this.$emit('changeStructure', this.nodeId+'|nodeType='+newValue);
        },
        changeNodeQuantity(newValue){
            this.$emit('changeStructure', this.nodeId+'|quantity='+newValue);
        },
        changeNodeResource(newValue){
            this.$emit('changeStructure', this.nodeId+'|resource='+newValue);
        },
        bubbleUp(value){
            this.$emit('changeStructure', this.nodeId+'|'+value);
        }
    },
    mounted: function(){
    },
    watch: {
    },
    template:
    `
        <table>
            <tr>
                <td v-if="showExcludeButton == 'true'">
                    <button type="button" class="btn btn-danger" @click="removeNode()">X</button>
                </td>
                <td>
                    <select class="form-select selectNodeType" :value="nodeType"
                        @change="changeNodeType($event.target.value)">
                      <option value="null"></option>
                      <option value="and">And</option>
                      <option value="or">Or</option>
                      <option value="quantity">Quantity</option>
                      <option value="resource">Resource</option>
                    </select>
                </td>
                <td>
                    <button v-if="isInternNode"
                        type="button" class="btn btn-primary" @click="addChild()">+</button>
                    <span v-if="isInternNode && noChildren">Needs at least one child</span>
                </td>
                <td>
                    <input class="nodeQuantityNumber" :value="quantity" type="number" v-if="nodeType == 'quantity'"
                        @change="changeNodeQuantity($event.target.value)"/>
                    <select v-if="nodeType == 'resource'" class="form-select resourceSelect"
                        :value="resource" @change="changeNodeResource($event.target.value)">
                      <option selected v-bind:value="null"></option>
                      <option v-for="resource in resources" v-bind:value="resource.id">{{resource.name}}</option>
                    </select>
                </td>
            </tr>
        </table>
        <table>
            <tr>
                <td class="col-md-1">
                </td>
                <td class="col-md-11">
                    <div class="nodeChildren" v-if="nodeType != 'resource' && nodeType != null">
                        <div v-for="(child, index) in children">
                            <Node @changeStructure="bubbleUp" :nodeId="child.nodeId" :nodeType="child.nodeType"
                                    :quantity="child.quantity" :resource="child.resource"
                                    :children="child.children" showExcludeButton="true"/>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    `
}