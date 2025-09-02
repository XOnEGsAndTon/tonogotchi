// Simplified TIP-4 compatible NFT Item with mortality switch

contract NftItem {
    int birth_time;
    int lifespan_days;
    slice dna_hash;
    cell base_stats;
    bool is_dead;
    int death_time;
    slice content_uri;
    address editor; // controller allowed to declare death exactly once

    const slice GRAVE_URI = "gr:replace_with_cid"; // replace at deploy with real CID

    // External function: declare death and switch to grave content
    external fun declareDeath(int death_time_in) {
        require(msg.sender == self.data.editor);
        require(!self.data.is_dead);
        self.data.is_dead = true;
        self.data.death_time = death_time_in;
        self.data.content_uri = GRAVE_URI;
        self.data.editor = null();
    }
}

