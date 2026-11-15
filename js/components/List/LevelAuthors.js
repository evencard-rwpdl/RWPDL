export default {
    props: {
        creator: {
            type: String,
            required: true,
        },
        firstvictor: {
            type: String,
            required: true,
        },
    },
    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ creator }}</span>
                </p>
            </template>
            <template v-else="">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <span>{{ creator }}</span>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ firstvictor }}</span>
                </p>
            </template>
            <div class="type-title-sm">Publisher</div>
            <p class="type-body">
                <span>{{ creator }}</span>
            </p>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.creator === this.firstvictor;
        },
    },
};
